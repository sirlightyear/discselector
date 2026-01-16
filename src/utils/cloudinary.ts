import { supabase } from '../lib/supabase';

export async function uploadToCloudinary(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
  const filePath = `photos/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('disc-photos')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) {
    throw new Error('Failed to upload image: ' + uploadError.message);
  }

  const { data } = supabase.storage
    .from('disc-photos')
    .getPublicUrl(filePath);

  return data.publicUrl;
}
