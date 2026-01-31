import { useState, useEffect, useRef } from 'react';

const LazyImage = ({ src, alt, placeholder, style, className }) => {
    const [imageSrc, setImageSrc] = useState(placeholder || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');
    const [imageRef, setImageRef] = useState();
    const [isLoaded, setIsLoaded] = useState(false);

    const onLoad = () => {
        setIsLoaded(true);
    };

    const onError = () => {
        // Fallback silently - image not found
    };

    useEffect(() => {
        let observer;
        let didCancel = false;

        if (imageRef && imageSrc !== src) {
            if (IntersectionObserver) {
                observer = new IntersectionObserver(
                    entries => {
                        entries.forEach(entry => {
                            if (
                                !didCancel &&
                                (entry.intersectionRatio > 0 || entry.isIntersecting)
                            ) {
                                setImageSrc(src);
                                observer.unobserve(imageRef);
                            }
                        });
                    },
                    {
                        threshold: 0.01,
                        rootMargin: '75%'
                    }
                );
                observer.observe(imageRef);
            } else {
                // Fallback for older browsers
                setImageSrc(src);
            }
        }
        return () => {
            didCancel = true;
            if (observer && observer.unobserve) {
                observer.unobserve(imageRef);
            }
        };
    }, [src, imageSrc, imageRef]);

    return (
        <img
            ref={setImageRef}
            src={imageSrc}
            alt={alt}
            style={{
                ...style,
                opacity: isLoaded ? 1 : 0.5,
                transition: 'opacity 0.3s ease-in-out',
                filter: isLoaded ? 'none' : 'blur(5px)'
            }}
            className={className}
            onLoad={onLoad}
            onError={onError}
            loading="lazy" // Native support as backup
        />
    );
};

export default LazyImage;
