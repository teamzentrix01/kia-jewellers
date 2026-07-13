'use client';
import { useState, useRef } from 'react';
import { Link, Upload, X, Image, Video, Eye } from 'lucide-react';

// Upload to Cloudinary or convert to base64
// Since we may not have Cloudinary, we'll use base64 for file uploads
// and allow URL input for external images/videos

export default function MediaUpload({ value, onChange, label = "Image", index = null, accept = "image/*,video/*" }) {
    const [tab, setTab] = useState('url'); // 'url' | 'upload'
    const [preview, setPreview] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef(null);

    const isVideo = (src) => src && (src.includes('.mp4') || src.includes('.webm') || src.includes('.mov') || src.includes('video'));

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            // Convert to base64
            const reader = new FileReader();
            reader.onload = (ev) => {
                onChange(ev.target.result);
                setUploading(false);
            };
            reader.readAsDataURL(file);
        } catch (err) {
            console.error('Upload error:', err);
            setUploading(false);
        }
    };

    const clearValue = () => { onChange(''); if (fileRef.current) fileRef.current.value = ''; };

    return (
        <div className="space-y-2">
            {label && (
                <span className="block text-xs font-bold uppercase tracking-widest text-stone-500">
                    {label}{index !== null ? ` ${index + 1}` : ''}
                </span>
            )}

            {/* Tab switcher */}
            <div className="flex gap-1 p-1 bg-stone-100 rounded-lg w-fit">
                <button type="button" onClick={() => setTab('url')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition ${tab === 'url' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}>
                    <Link size={12} /> URL
                </button>
                <button type="button" onClick={() => setTab('upload')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition ${tab === 'upload' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}>
                    <Upload size={12} /> Upload
                </button>
            </div>

            {/* URL input */}
            {tab === 'url' && (
                <div className="relative">
                    <input
                        type="url"
                        value={value || ''}
                        onChange={e => onChange(e.target.value)}
                        placeholder="https://example.com/image.jpg or video.mp4"
                        className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm font-semibold text-stone-950 outline-none focus:border-stone-950 pr-16"
                    />
                    {value && (
                        <div className="absolute right-2 top-1.5 flex gap-1">
                            <button type="button" onClick={() => setPreview(p => !p)}
                                className="p-1 text-stone-400 hover:text-stone-700 transition" title="Preview">
                                <Eye size={14} />
                            </button>
                            <button type="button" onClick={clearValue}
                                className="p-1 text-stone-400 hover:text-red-500 transition" title="Clear">
                                <X size={14} />
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* File upload */}
            {tab === 'upload' && (
                <div>
                    <input
                        ref={fileRef}
                        type="file"
                        accept={accept}
                        onChange={handleFileChange}
                        className="hidden"
                        id={`media-upload-${label}-${index}`}
                    />
                    {!value ? (
                        <label
                            htmlFor={`media-upload-${label}-${index}`}
                            className="flex flex-col items-center justify-center gap-2 w-full h-24 border-2 border-dashed border-stone-300 rounded-lg cursor-pointer hover:border-stone-500 hover:bg-stone-50 transition"
                        >
                            {uploading ? (
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-stone-600" />
                            ) : (
                                <>
                                    <div className="flex gap-2 text-stone-400">
                                        <Image size={18} />
                                        <Video size={18} />
                                    </div>
                                    <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                                        Click to upload image or video
                                    </span>
                                    <span className="text-[10px] text-stone-400">JPG, PNG, GIF, MP4, WebM</span>
                                </>
                            )}
                        </label>
                    ) : (
                        <div className="flex items-center gap-3 p-2 bg-stone-50 border border-stone-200 rounded-lg">
                            {isVideo(value) ? (
                                <video src={value} className="w-14 h-14 rounded object-cover" />
                            ) : (
                                <img src={value} alt="preview" className="w-14 h-14 rounded object-cover border border-stone-200" />
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-stone-700 truncate">
                                    {isVideo(value) ? '🎬 Video uploaded' : '🖼️ Image uploaded'}
                                </p>
                                <p className="text-[10px] text-stone-400 mt-0.5">
                                    {value.startsWith('data:') ? 'Local file (base64)' : value.substring(0, 40) + '...'}
                                </p>
                            </div>
                            <button type="button" onClick={clearValue}
                                className="text-stone-400 hover:text-red-500 transition p-1">
                                <X size={16} />
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Preview panel */}
            {preview && value && (
                <div className="relative rounded-lg overflow-hidden border border-stone-200 bg-stone-50">
                    <button type="button" onClick={() => setPreview(false)}
                        className="absolute top-2 right-2 z-10 bg-white rounded-full p-1 shadow text-stone-500 hover:text-stone-800">
                        <X size={14} />
                    </button>
                    {isVideo(value) ? (
                        <video src={value} controls className="w-full max-h-48 object-contain" />
                    ) : (
                        <img src={value} alt="preview" className="w-full max-h-48 object-contain" />
                    )}
                </div>
            )}

            {/* Thumbnail when value exists and no preview open */}
            {!preview && value && tab === 'url' && (
                <div className="flex items-center gap-2">
                    {isVideo(value) ? (
                        <div className="flex items-center gap-2 text-xs text-stone-500">
                            <Video size={14} className="text-blue-500" />
                            <span>Video URL set</span>
                        </div>
                    ) : (
                        <img src={value} alt="thumb"
                            className="w-10 h-10 rounded object-cover border border-stone-200"
                            onError={e => e.target.style.display = 'none'}
                        />
                    )}
                </div>
            )}
        </div>
    );
}