begin;

update public.service_catalog
   set service_name='Transportasi & Distribusi Domestik',
       description='Transportasi penumpang serta distribusi barang domestik dengan pilihan mobil penumpang hingga armada kargo.',
       estimated_days='Sesuai rute'
 where service_code='trucking';

commit;
