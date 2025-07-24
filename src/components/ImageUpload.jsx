import { useState, useRef } from 'react';
import imageCompression from 'browser-image-compression';
import { Camera } from 'lucide-react';
import { supabase } from '../supabase/config';
import { useAuth } from '../context/AuthContext';

const ImageUpload = ({ onImageUploaded, initialImage = '/defaultPfp.png' }) => {
    const { user } = useAuth();
    const [preview, setPreview] = useState(initialImage);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleImageChange = async (event) => {
        const file = event.target.files[0];
        if (!file || !user) return;

        setIsUploading(true);
        setPreview(URL.createObjectURL(file));

        try {
            const options = { maxSizeMB: 0.5, maxWidthOrHeight: 800, useWebWorker: true };
            const compressedFile = await imageCompression(file, options);

            const filePath = `${user.id}/${Date.now()}-${compressedFile.name}`;

            const { error: uploadError } = await supabase.storage
                .from('pfp')
                .upload(filePath, compressedFile);

            if (uploadError) {
                throw uploadError;
            }

            const { data } = supabase.storage
                .from('pfp')
                .getPublicUrl(filePath);

            if (!data || !data.publicUrl) {
                throw new Error("Could not get public URL for the uploaded image.");
            }

            onImageUploaded(data.publicUrl);
            setPreview(data.publicUrl);

        } catch (error) {
            console.error("Error processing image:", error);
            setPreview(initialImage);
            alert(`Image upload failed: ${error.message}`);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <div
                className="relative w-32 h-32 rounded-full cursor-pointer group"
                onClick={() => fileInputRef.current.click()}
            >
                <img
                    src={preview}
                    alt="Profile Preview"
                    className="w-full h-full rounded-full object-cover border-4 border-gray-600"
                    onError={(e) => { e.target.onerror = null; e.target.src = '/defaultPfp.png'; }}
                />
                <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="text-white" />
                </div>
            </div>
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/png, image/jpeg"
                onChange={handleImageChange}
            />
            {isUploading && <p className="text-sm text-gray-400">Uploading image...</p>}
        </div>
    );
};

export default ImageUpload;
