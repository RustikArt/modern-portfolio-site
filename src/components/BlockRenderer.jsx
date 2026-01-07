import React, { useState } from 'react';

// STYLES
const sectionStyle = {
    margin: '4rem 0',
    position: 'relative'
};

const titleStyle = {
    fontSize: '2.5rem',
    marginBottom: '1.5rem',
    lineHeight: 1.2
};

const fullImageStyle = {
    width: '100vw',
    marginLeft: '50%',
    transform: 'translateX(-50%)',
    height: '80vh',
    objectFit: 'cover'
};

// --- BLOCKS ---

const TextBlock = ({ block }) => (
    <div style={sectionStyle}>
        {block.content.split('\n').map((p, i) => (
            <p key={i} style={{ marginBottom: '1rem', fontSize: '1.1rem', lineHeight: 1.6, color: '#ddd' }}>{p}</p>
        ))}
    </div>
);

const StrongTitleBlock = ({ block }) => (
    <div style={sectionStyle}>
        <h2 style={titleStyle}>{block.content}</h2>
    </div>
);

const StatementBlock = ({ block }) => (
    <div style={{ ...sectionStyle, padding: '4rem 0', textAlign: 'center' }}>
        <p style={{ fontSize: '3rem', fontWeight: 'bold', lineHeight: 1.1, background: 'linear-gradient(to right, #fff, #888)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {block.content}
        </p>
    </div>
);

const FullImageBlock = ({ block }) => (
    <div style={sectionStyle}>
        <img src={block.content.url} alt={block.content.caption || ''} style={fullImageStyle} />
        {block.content.caption && <p style={{ textAlign: 'center', marginTop: '1rem', color: '#888', fontSize: '0.9rem' }}>{block.content.caption}</p>}
    </div>
);

const ImageCaptionBlock = ({ block }) => (
    <div style={{ ...sectionStyle, display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', alignItems: 'end' }}>
        <img src={block.content.url} alt="" style={{ width: '100%', borderRadius: '4px' }} />
        <p style={{ color: '#aaa', fontSize: '0.9rem', borderLeft: '1px solid #333', paddingLeft: '1rem' }}>{block.content.caption}</p>
    </div>
);

const GalleryBlock = ({ block }) => (
    <div style={{ ...sectionStyle, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
        {block.content.images && block.content.images.map((img, i) => (
            <img key={i} src={img} alt="" style={{ width: '100%', height: '300px', objectFit: 'cover', borderRadius: '4px' }} />
        ))}
    </div>
);

const VideoBlock = ({ block }) => (
    <div style={sectionStyle}>
        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
            <iframe
                src={block.content.url}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: '4px' }}
                frameBorder="0"
                allowFullScreen
                title="Video"
            />
        </div>
    </div>
);

const QuoteBlock = ({ block }) => (
    <div style={{ ...sectionStyle, background: '#111', padding: '3rem', borderLeft: '4px solid var(--color-accent)' }}>
        <p style={{ fontSize: '1.5rem', fontStyle: 'italic', marginBottom: '1rem' }}>"{block.content.text}"</p>
        <cite style={{ color: '#888' }}>— {block.content.author}</cite>
    </div>
);

const ChecklistBlock = ({ block }) => (
    <div style={{ ...sectionStyle, background: '#0a0a0a', padding: '2rem', border: '1px dashed #333' }}>
        <h3 style={{ marginBottom: '1rem' }}>Checklist</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
            {block.content.items && block.content.items.map((item, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--color-accent)' }}>✓</span>
                    <span style={{ color: item.done ? '#666' : '#fff', textDecoration: item.done ? 'line-through' : 'none' }}>{item.text}</span>
                </li>
            ))}
        </ul>
    </div>
);

const LinkBlock = ({ block }) => (
    <div style={sectionStyle}>
        <a href={block.content.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            🔗 {block.content.text}
        </a>
    </div>
);

const SeparatorBlock = () => (
    <div style={{ ...sectionStyle, height: '1px', background: 'linear-gradient(to right, transparent, #333, transparent)' }} />
);

const TimelineBlock = ({ block }) => (
    <div style={sectionStyle}>
        <h3 style={{ marginBottom: '2rem', textAlign: 'center' }}>Chronologie</h3>
        <div style={{ borderLeft: '2px solid #333', paddingLeft: '2rem', marginLeft: '1rem' }}>
            {block.content.events && block.content.events.map((event, i) => (
                <div key={i} style={{ marginBottom: '2rem', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: 0, left: '-2.6rem', width: '1rem', height: '1rem', background: 'var(--color-accent)', borderRadius: '50%' }} />
                    <span style={{ color: '#888', fontSize: '0.9rem' }}>{event.date}</span>
                    <h4 style={{ margin: '0.5rem 0' }}>{event.title}</h4>
                    <p style={{ color: '#ccc' }}>{event.description}</p>
                </div>
            ))}
        </div>
    </div>
);

const StepsBlock = ({ block }) => (
    <div style={sectionStyle}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
            {block.content.steps && block.content.steps.map((step, i) => (
                <div key={i} style={{ background: '#111', padding: '2rem', borderRadius: '4px', borderTop: '4px solid var(--color-accent)' }}>
                    <span style={{ fontSize: '3rem', fontWeight: 'bold', color: '#222', display: 'block', marginBottom: '1rem' }}>{String(i + 1).padStart(2, '0')}</span>
                    <h4 style={{ marginBottom: '1rem' }}>{step.title}</h4>
                    <p style={{ color: '#aaa', fontSize: '0.9rem' }}>{step.description}</p>
                </div>
            ))}
        </div>
    </div>
);

const BeforeAfterBlock = ({ block }) => (
    <div style={{ ...sectionStyle, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
            <span style={{ display: 'block', marginBottom: '0.5rem', color: '#888', textAlign: 'center' }}>AVANT</span>
            <img src={block.content.before} alt="Before" style={{ width: '100%', borderRadius: '4px' }} />
        </div>
        <div>
            <span style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-accent)', textAlign: 'center' }}>APRÈS</span>
            <img src={block.content.after} alt="After" style={{ width: '100%', borderRadius: '4px' }} />
        </div>
    </div>
);

const NoteBlock = ({ block }) => (
    <div style={{ ...sectionStyle, background: block.content.type === 'warning' ? '#331100' : '#001133', padding: '2rem', borderLeft: `4px solid ${block.content.type === 'warning' ? 'orange' : 'teal'}` }}>
        <h4 style={{ color: block.content.type === 'warning' ? 'orange' : 'teal', marginBottom: '0.5rem', textTransform: 'uppercase' }}>{block.content.title || 'Note'}</h4>
        <p>{block.content.text}</p>
    </div>
);

const DownloadBlock = ({ block }) => (
    <div style={sectionStyle}>
        <a href={block.content.url} download className="btn" style={{ background: '#222', border: '1px solid #444', display: 'inline-flex', alignItems: 'center', gap: '1rem', padding: '1rem 2rem' }}>
            <span style={{ fontSize: '1.5rem' }}>⬇️</span>
            <div style={{ textAlign: 'left' }}>
                <span style={{ display: 'block', fontWeight: 'bold' }}>{block.content.label}</span>
                <span style={{ fontSize: '0.8rem', color: '#888' }}>{block.content.info}</span>
            </div>
        </a>
    </div>
);
const UnknownBlock = ({ type }) => (
    <div style={{ padding: '1rem', border: '1px solid red', color: 'red' }}>Unknown block type: {type}</div>
);

const BlockRenderer = ({ blocks }) => {
    if (!blocks || !Array.isArray(blocks)) return null;

    return (
        <div className="block-renderer">
            {blocks.map((block, index) => {
                switch (block.type) {
                    case 'text': return <TextBlock key={block.id || index} block={block} />;
                    case 'title': return <StrongTitleBlock key={block.id || index} block={block} />;
                    case 'statement': return <StatementBlock key={block.id || index} block={block} />;
                    case 'full-image': return <FullImageBlock key={block.id || index} block={block} />;
                    case 'image-caption': return <ImageCaptionBlock key={block.id || index} block={block} />;
                    case 'gallery': return <GalleryBlock key={block.id || index} block={block} />;
                    case 'video': return <VideoBlock key={block.id || index} block={block} />;
                    case 'quote': return <QuoteBlock key={block.id || index} block={block} />;
                    case 'checklist': return <ChecklistBlock key={block.id || index} block={block} />;
                    case 'link': return <LinkBlock key={block.id || index} block={block} />;
                    case 'separator': return <SeparatorBlock key={block.id || index} />;
                    case 'timeline': return <TimelineBlock key={block.id || index} block={block} />;
                    case 'steps': return <StepsBlock key={block.id || index} block={block} />;
                    case 'before-after': return <BeforeAfterBlock key={block.id || index} block={block} />;
                    case 'note': return <NoteBlock key={block.id || index} block={block} />;
                    case 'download': return <DownloadBlock key={block.id || index} block={block} />;
                    default: return <UnknownBlock key={block.id || index} type={block.type} />;
                }
            })}
        </div>
    );
};

export default BlockRenderer;
