import React from 'react';
import { FileText, Play, File } from 'lucide-react';

interface EmbeddedContentProps {
    type: 'video' | 'pdf' | 'text';
    url: string;
    title: string;
    description?: string;
}

export const EmbeddedContentPlayer: React.FC<EmbeddedContentProps> = ({ type, url, title, description }) => {
    const getEmbedUrl = (url: string) => {
        if (type === 'video') {
            // Convert YouTube watch URL to embed URL
            if (url.includes('youtube.com/watch')) {
                const videoId = new URLSearchParams(new URL(url).search).get('v');
                return `https://www.youtube.com/embed/${videoId}`;
            } else if (url.includes('youtu.be/')) {
                const videoId = url.split('youtu.be/')[1];
                return `https://www.youtube.com/embed/${videoId}`;
            }
        }
        return url;
    };

    const renderContent = () => {
        switch (type) {
            case 'video':
                return (
                    <div className="aspect-video w-full rounded-lg overflow-hidden bg-black shadow-lg">
                        <iframe
                            src={getEmbedUrl(url)}
                            title={title}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                );
            case 'pdf':
                return (
                    <div className="h-[600px] w-full rounded-lg overflow-hidden border border-gray-200 shadow-lg bg-gray-50">
                        <iframe
                            src={url}
                            title={title}
                            className="w-full h-full"
                        />
                    </div>
                );
            case 'text':
                return (
                    <div className="prose max-w-none p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <h3 className="text-xl font-bold mb-4">{title}</h3>
                        <div className="whitespace-pre-wrap text-gray-700">{description}</div>
                        {url && (
                             <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline mt-4 block">
                                Read full article &rarr;
                            </a>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
                {type === 'video' && <Play className="w-5 h-5 text-red-600" />}
                {type === 'pdf' && <File className="w-5 h-5 text-orange-600" />}
                {type === 'text' && <FileText className="w-5 h-5 text-blue-600" />}
                <h4 className="text-lg font-semibold text-gray-900">{title}</h4>
            </div>
            {renderContent()}
            {description && type !== 'text' && (
                <p className="mt-2 text-sm text-gray-600">{description}</p>
            )}
        </div>
    );
};
