alter table public.upgrade_requests
  rename column razorpay_order_id to payment_order_id;

alter table public.upgrade_requests
  rename column razorpay_payment_id to payment_id;

alter table public.upgrade_requests
  rename column razorpay_signature to payment_signature;
