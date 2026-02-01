import React, { useState } from 'react';
import { Check, ExternalLink, Download, AlertTriangle, Lightbulb, Award, MapPin, Zap, Code as CodeIcon, Sparkles } from 'lucide-react';

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
                    <Check size={16} style={{ color: 'var(--color-accent)' }} />
                    <span style={{ color: item.done ? '#666' : '#fff', textDecoration: item.done ? 'line-through' : 'none' }}>{item.text}</span>
                </li>
            ))}
        </ul>
    </div>
);

const LinkBlock = ({ block }) => (
    <div style={sectionStyle}>
        <a href={block.content.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <ExternalLink size={16} /> {block.content.text}
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
            <Download size={24} />
            <div style={{ textAlign: 'left' }}>
                <span style={{ display: 'block', fontWeight: 'bold' }}>{block.content.label}</span>
                <span style={{ fontSize: '0.8rem', color: '#888' }}>{block.content.info}</span>
            </div>
        </a>
    </div>
);

// === NEW BLOCKS ===

const CodeBlock = ({ block }) => (
    <div style={sectionStyle}>
        <div style={{ background: '#0a0a0a', border: '1px solid #333', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ padding: '0.75rem 1rem', background: '#151515', borderBottom: '1px solid #333', fontSize: '0.8rem', color: '#666' }}>
                <CodeIcon size={14} style={{ display: 'inline', marginRight: '0.5rem' }} />
                {block.content.language}
            </div>
            <pre style={{ padding: '1.5rem', margin: 0, overflow: 'auto', fontSize: '0.9rem', lineHeight: 1.5, fontFamily: 'monospace' }}>
                <code>{block.content.code}</code>
            </pre>
        </div>
    </div>
);

const StatsBlock = ({ block }) => (
    <div style={{ ...sectionStyle, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '2rem', textAlign: 'center' }}>
        {block.content.stats && block.content.stats.map((stat, i) => (
            <div key={i} style={{ padding: '2rem' }}>
                <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--color-accent)', lineHeight: 1 }}>
                    {stat.value}{stat.suffix}
                </div>
                <div style={{ marginTop: '0.5rem', color: '#888', fontSize: '0.9rem', textTransform: 'uppercase' }}>{stat.label}</div>
            </div>
        ))}
    </div>
);

const FeaturesBlock = ({ block }) => (
    <div style={{ ...sectionStyle, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
        {block.content.features && block.content.features.map((feat, i) => (
            <div key={i} style={{ padding: '2rem', background: '#0a0a0a', border: '1px solid #222', borderRadius: '8px' }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{feat.icon}</div>
                <h4 style={{ marginBottom: '0.75rem' }}>{feat.title}</h4>
                <p style={{ color: '#aaa', fontSize: '0.9rem', lineHeight: 1.5 }}>{feat.description}</p>
            </div>
        ))}
    </div>
);

const TeamBlock = ({ block }) => (
    <div style={{ ...sectionStyle, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
        {block.content.members && block.content.members.map((mem, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
                {mem.image && <img src={mem.image} alt={mem.name} style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', marginBottom: '1rem' }} />}
                <h4 style={{ marginBottom: '0.25rem' }}>{mem.name}</h4>
                <p style={{ color: '#888', fontSize: '0.9rem' }}>{mem.role}</p>
            </div>
        ))}
    </div>
);

const TestimonialBlock = ({ block }) => (
    <div style={{ ...sectionStyle, background: '#0a0a0a', padding: '3rem', borderRadius: '8px', textAlign: 'center' }}>
        <p style={{ fontSize: '1.3rem', fontStyle: 'italic', marginBottom: '2rem', lineHeight: 1.6 }}>"{block.content.text}"</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
            {block.content.avatar && <img src={block.content.avatar} alt={block.content.author} style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }} />}
            <div style={{ textAlign: 'left' }}>
                <strong>{block.content.author}</strong>
                {block.content.company && <span style={{ display: 'block', color: '#666', fontSize: '0.85rem' }}>{block.content.company}</span>}
            </div>
        </div>
    </div>
);

const AwardBlock = ({ block }) => (
    <div style={{ ...sectionStyle, display: 'flex', alignItems: 'center', gap: '2rem', padding: '2rem', background: 'linear-gradient(135deg, #111 0%, #0a0a0a 100%)', border: '1px solid #333', borderRadius: '8px' }}>
        {block.content.image ? (
            <img src={block.content.image} alt={block.content.title} style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
        ) : (
            <Award size={60} style={{ color: 'var(--color-accent)' }} />
        )}
        <div>
            <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.25rem' }}>{block.content.year}</div>
            <h4 style={{ marginBottom: '0.5rem' }}>{block.content.title}</h4>
            <p style={{ color: '#888', fontSize: '0.9rem' }}>{block.content.description}</p>
        </div>
    </div>
);

const LocationBlock = ({ block }) => (
    <div style={sectionStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: '#888' }}>
            <MapPin size={18} /> {block.content.address}
        </div>
        {block.content.mapUrl && (
            <div style={{ position: 'relative', paddingBottom: '40%', height: 0 }}>
                <iframe
                    src={block.content.mapUrl}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0, borderRadius: '8px', filter: 'grayscale(1) invert(1)' }}
                    allowFullScreen
                    loading="lazy"
                    title="Location"
                />
            </div>
        )}
    </div>
);

const CalloutBlock = ({ block }) => {
    const colors = {
        accent: 'var(--color-accent)',
        green: '#22c55e',
        blue: '#3b82f6',
        orange: '#f97316',
        red: '#ef4444'
    };
    const color = colors[block.content.color] || colors.accent;
    return (
        <div style={{ ...sectionStyle, padding: '2rem', background: `linear-gradient(135deg, ${color}15 0%, transparent 100%)`, border: `1px solid ${color}40`, borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <Zap size={20} style={{ color }} />
                <h4 style={{ color, margin: 0 }}>{block.content.title}</h4>
            </div>
            <p style={{ color: '#ccc', lineHeight: 1.6 }}>{block.content.text}</p>
        </div>
    );
};

const WarningBlock = ({ block }) => (
    <div style={{ ...sectionStyle, padding: '2rem', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <AlertTriangle size={20} style={{ color: '#f59e0b' }} />
            <h4 style={{ color: '#f59e0b', margin: 0 }}>{block.content.title}</h4>
        </div>
        <p style={{ color: '#ccc', lineHeight: 1.6 }}>{block.content.text}</p>
    </div>
);

const TipBlock = ({ block }) => (
    <div style={{ ...sectionStyle, padding: '2rem', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <Lightbulb size={20} style={{ color: '#22c55e' }} />
            <h4 style={{ color: '#22c55e', margin: 0 }}>{block.content.title}</h4>
        </div>
        <p style={{ color: '#ccc', lineHeight: 1.6 }}>{block.content.text}</p>
    </div>
);

const HighlightBlock = ({ block }) => (
    <div style={{ ...sectionStyle, display: 'grid', gridTemplateColumns: block.content.image ? '1fr 1fr' : '1fr', gap: '2rem', alignItems: 'center', padding: '3rem', background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)', borderRadius: '8px' }}>
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <Sparkles size={20} style={{ color: 'var(--color-accent)' }} />
                <h3 style={{ margin: 0 }}>{block.content.title}</h3>
            </div>
            <p style={{ color: '#aaa', lineHeight: 1.7 }}>{block.content.text}</p>
        </div>
        {block.content.image && <img src={block.content.image} alt={block.content.title} style={{ width: '100%', borderRadius: '8px' }} />}
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
                    // New blocks
                    case 'code': return <CodeBlock key={block.id || index} block={block} />;
                    case 'stats': return <StatsBlock key={block.id || index} block={block} />;
                    case 'features': return <FeaturesBlock key={block.id || index} block={block} />;
                    case 'team': return <TeamBlock key={block.id || index} block={block} />;
                    case 'testimonial': return <TestimonialBlock key={block.id || index} block={block} />;
                    case 'award': return <AwardBlock key={block.id || index} block={block} />;
                    case 'location': return <LocationBlock key={block.id || index} block={block} />;
                    case 'callout': return <CalloutBlock key={block.id || index} block={block} />;
                    case 'warning': return <WarningBlock key={block.id || index} block={block} />;
                    case 'tip': return <TipBlock key={block.id || index} block={block} />;
                    case 'highlight': return <HighlightBlock key={block.id || index} block={block} />;
                    default: return <UnknownBlock key={block.id || index} type={block.type} />;
                }
            })}
        </div>
    );
};

export default BlockRenderer;
