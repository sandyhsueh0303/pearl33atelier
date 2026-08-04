-- Prevent concurrent checkout overselling by reserving the required material
-- inventory before a customer is redirected to Stripe.

alter table public.inventory_items
add column if not exists reserved_quantity integer not null default 0;

alter table public.inventory_items
drop constraint if exists inventory_items_quantities_nonnegative;

alter table public.inventory_items
add constraint inventory_items_quantities_nonnegative
check (
  total_quantity >= 0
  and allocated_quantity >= 0
  and reserved_quantity >= 0
);

alter table public.inventory_items
drop constraint if exists inventory_items_quantities_within_total;

alter table public.inventory_items
add constraint inventory_items_quantities_within_total
check (allocated_quantity + reserved_quantity <= total_quantity);

create table if not exists public.order_material_reservations (
  order_id uuid not null
    references public.orders(id)
    on delete cascade,
  inventory_item_id uuid not null
    references public.inventory_items(id),
  quantity integer not null
    check (quantity > 0),
  status text not null default 'active'
    check (status in ('active', 'consumed', 'released')),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (order_id, inventory_item_id)
);

create index if not exists order_material_reservations_active_expiry_idx
on public.order_material_reservations (expires_at)
where status = 'active';

create or replace function public.reserve_order_materials(
  p_order_id uuid,
  p_expires_at timestamptz
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_order_status text;
  v_existing_statuses text[];
  v_material record;
  v_reserved_count integer := 0;
begin
  if p_expires_at <= now() then
    raise exception using
      errcode = 'P0001',
      message = 'RESERVATION_EXPIRY_MUST_BE_IN_FUTURE';
  end if;

  select o.status
  into v_order_status
  from public.orders o
  where o.id = p_order_id
  for update;

  if not found then
    raise exception using errcode = 'P0001', message = 'ORDER_NOT_FOUND';
  end if;

  if v_order_status <> 'pending' then
    raise exception using errcode = 'P0001', message = 'ORDER_IS_NOT_PENDING';
  end if;

  select array_agg(distinct r.status order by r.status)
  into v_existing_statuses
  from public.order_material_reservations r
  where r.order_id = p_order_id;

  if coalesce(array_length(v_existing_statuses, 1), 0) > 0 then
    if v_existing_statuses = array['active'] then
      return jsonb_build_object('state', 'already_reserved');
    end if;

    raise exception using errcode = 'P0001', message = 'ORDER_RESERVATION_ALREADY_FINALIZED';
  end if;

  if not exists (
    select 1
    from public.order_items oi
    where oi.order_id = p_order_id
  ) then
    raise exception using errcode = 'P0001', message = 'ORDER_HAS_NO_ITEMS';
  end if;

  -- Lock every required inventory row in the same deterministic order before
  -- checking capacity. A concurrent reservation for the same material waits
  -- here, then sees the committed reserved_quantity before it can continue.
  for v_material in
    select
      i.id as inventory_item_id,
      i.name as material_name,
      i.total_quantity,
      i.allocated_quantity,
      i.reserved_quantity,
      required.quantity
    from public.inventory_items i
    join (
      select
        pm.inventory_item_id,
        sum(greatest(1, floor(pm.quantity_per_unit)::integer) * oi.quantity)::integer as quantity
      from public.order_items oi
      join public.product_materials pm
        on pm.product_id = oi.product_id
      where oi.order_id = p_order_id
      group by pm.inventory_item_id
    ) required
      on required.inventory_item_id = i.id
    order by i.id
    for update of i
  loop
    if v_material.total_quantity - v_material.allocated_quantity - v_material.reserved_quantity
      < v_material.quantity then
      raise exception using
        errcode = 'P0001',
        message = 'INSUFFICIENT_INVENTORY',
        detail = coalesce(v_material.material_name, v_material.inventory_item_id::text);
    end if;
  end loop;

  insert into public.order_material_reservations (
    order_id,
    inventory_item_id,
    quantity,
    status,
    expires_at
  )
  select
    p_order_id,
    pm.inventory_item_id,
    sum(greatest(1, floor(pm.quantity_per_unit)::integer) * oi.quantity)::integer,
    'active',
    p_expires_at
  from public.order_items oi
  join public.product_materials pm
    on pm.product_id = oi.product_id
  where oi.order_id = p_order_id
  group by pm.inventory_item_id;

  get diagnostics v_reserved_count = row_count;

  update public.inventory_items i
  set reserved_quantity = i.reserved_quantity + r.quantity,
      updated_at = now()
  from public.order_material_reservations r
  where r.order_id = p_order_id
    and r.status = 'active'
    and r.inventory_item_id = i.id;

  return jsonb_build_object(
    'state', 'reserved',
    'material_count', v_reserved_count,
    'expires_at', p_expires_at
  );
end;
$$;

create or replace function public.consume_order_materials(
  p_order_id uuid
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_order_status text;
  v_active_count integer;
  v_consumed_count integer;
begin
  select o.status
  into v_order_status
  from public.orders o
  where o.id = p_order_id
  for update;

  if not found then
    raise exception using errcode = 'P0001', message = 'ORDER_NOT_FOUND';
  end if;

  if v_order_status = 'cancelled' then
    raise exception using errcode = 'P0001', message = 'ORDER_ALREADY_CANCELLED';
  end if;

  -- Lock inventory rows in deterministic order before moving an active
  -- reservation into allocated inventory.
  perform 1
  from public.inventory_items i
  join public.order_material_reservations r
    on r.inventory_item_id = i.id
  where r.order_id = p_order_id
    and r.status = 'active'
  order by i.id
  for update of i, r;

  select count(*)
  into v_active_count
  from public.order_material_reservations r
  where r.order_id = p_order_id
    and r.status = 'active';

  if v_active_count = 0 then
    select count(*)
    into v_consumed_count
    from public.order_material_reservations r
    where r.order_id = p_order_id
      and r.status = 'consumed';

    if v_order_status = 'paid' or v_consumed_count > 0 then
      return jsonb_build_object('state', 'already_consumed');
    end if;

    update public.orders
    set status = 'paid',
        updated_at = now()
    where id = p_order_id;

    return jsonb_build_object('state', 'no_reservation');
  else
    if exists (
      select 1
      from public.order_material_reservations r
      where r.order_id = p_order_id
        and r.status = 'active'
        and r.expires_at <= now()
    ) then
      raise exception using errcode = 'P0001', message = 'RESERVATION_EXPIRED';
    end if;

    update public.inventory_items i
    set reserved_quantity = i.reserved_quantity - r.quantity,
        allocated_quantity = i.allocated_quantity + r.quantity,
        updated_at = now()
    from public.order_material_reservations r
    where r.order_id = p_order_id
      and r.status = 'active'
      and r.inventory_item_id = i.id;

    update public.order_material_reservations
    set status = 'consumed',
        updated_at = now()
    where order_id = p_order_id
      and status = 'active';
  end if;

  update public.orders
  set status = 'paid',
      updated_at = now()
  where id = p_order_id;

  return jsonb_build_object('state', 'consumed');
end;
$$;

create or replace function public.release_order_materials(
  p_order_id uuid
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_order_status text;
  v_active_count integer;
  v_released_count integer;
begin
  select o.status
  into v_order_status
  from public.orders o
  where o.id = p_order_id
  for update;

  if not found then
    raise exception using errcode = 'P0001', message = 'ORDER_NOT_FOUND';
  end if;

  if v_order_status = 'paid' then
    return jsonb_build_object('state', 'already_consumed');
  end if;

  perform 1
  from public.inventory_items i
  join public.order_material_reservations r
    on r.inventory_item_id = i.id
  where r.order_id = p_order_id
    and r.status = 'active'
  order by i.id
  for update of i, r;

  select count(*)
  into v_active_count
  from public.order_material_reservations r
  where r.order_id = p_order_id
    and r.status = 'active';

  if v_active_count = 0 then
    select count(*)
    into v_released_count
    from public.order_material_reservations r
    where r.order_id = p_order_id
      and r.status = 'released';

    if v_order_status = 'cancelled' or v_released_count > 0 then
      return jsonb_build_object('state', 'already_released');
    end if;
  else
    update public.inventory_items i
    set reserved_quantity = i.reserved_quantity - r.quantity,
        updated_at = now()
    from public.order_material_reservations r
    where r.order_id = p_order_id
      and r.status = 'active'
      and r.inventory_item_id = i.id;

    update public.order_material_reservations
    set status = 'released',
        updated_at = now()
    where order_id = p_order_id
      and status = 'active';
  end if;

  update public.orders
  set status = 'cancelled',
      updated_at = now()
  where id = p_order_id;

  return jsonb_build_object('state', 'released');
end;
$$;

revoke execute on function public.reserve_order_materials(uuid, timestamptz)
from public, anon, authenticated;
revoke execute on function public.consume_order_materials(uuid)
from public, anon, authenticated;
revoke execute on function public.release_order_materials(uuid)
from public, anon, authenticated;

grant execute on function public.reserve_order_materials(uuid, timestamptz)
to service_role;
grant execute on function public.consume_order_materials(uuid)
to service_role;
grant execute on function public.release_order_materials(uuid)
to service_role;
