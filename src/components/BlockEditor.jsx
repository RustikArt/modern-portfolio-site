import React, { useState } from 'react';

// --- BLOCK CONFIG ---
// Defines the structure and label for each block type
const BLOCK_TYPES = [
    { type: 'text', label: 'Texte / Paragraphe', icon: '📝' },
    { type: 'title', label: 'Titre Fort', icon: 'H1' },
    { type: 'statement', label: 'Statement (Gros Texte)', icon: '📢' },
    { type: 'full-image', label: 'Image Plein Écran', icon: '🖼️' },
    { type: 'image-caption', label: 'Image + Légende', icon: '🎑' },
    { type: 'gallery', label: 'Galerie', icon: '📚' },
    { type: 'video', label: 'Vidéo (Embed)', icon: '🎬' },
    { type: 'quote', label: 'Citation', icon: '❝' },
    { type: 'checklist', label: 'Checklist', icon: '✅' },
    { type: 'link', label: 'Lien Externe', icon: '🔗' },
    { type: 'timeline', label: 'Frise Chrono', icon: '📅' },
    { type: 'steps', label: 'Étapes / Process', icon: '👣' },
    { type: 'before-after', label: 'Avant / Après', icon: '🌗' },
    { type: 'note', label: 'Note / Encadré', icon: '📝' },
    { type: 'download', label: 'Fichier', icon: '💾' },
    { type: 'separator', label: 'Séparateur', icon: '➖' },
];

const BlockEditor = ({ blocks, onChange }) => {
    // Helper to add a new block
    const addBlock = (type) => {
        const newBlock = {
            id: Date.now(),
            type,
            content: getDefaultContent(type)
        };
        onChange([...blocks, newBlock]);
    };

    // Helper to update a block
    const updateBlock = (id, newContent) => {
        onChange(blocks.map(b => b.id === id ? { ...b, content: newContent } : b));
    };

    // Helper to remove a block
    const removeBlock = (id) => {
        onChange(blocks.filter(b => b.id !== id));
    };

    // Move block up/down
    const moveBlock = (index, direction) => {
        const newBlocks = [...blocks];
        if (direction === 'up' && index > 0) {
            [newBlocks[index], newBlocks[index - 1]] = [newBlocks[index - 1], newBlocks[index]];
        } else if (direction === 'down' && index < newBlocks.length - 1) {
            [newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]];
        }
        onChange(newBlocks);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* BLOCK LIST */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {blocks.map((block, index) => (
                    <div key={block.id} style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '4px', padding: '1rem' }}>

                        {/* HEADER: Type + Actions */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>
                            <span style={{ fontWeight: 'bold', color: '#888', textTransform: 'uppercase', fontSize: '0.8rem' }}>
                                {BLOCK_TYPES.find(t => t.type === block.type)?.label || block.type}
                            </span>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button type="button" onClick={() => moveBlock(index, 'up')} disabled={index === 0} style={actionBtnStyle}>⬆</button>
                                <button type="button" onClick={() => moveBlock(index, 'down')} disabled={index === blocks.length - 1} style={actionBtnStyle}>⬇</button>
                                <button type="button" onClick={() => removeBlock(block.id)} style={{ ...actionBtnStyle, color: 'red', borderColor: 'red' }}>🗑</button>
                            </div>
                        </div>

                        {/* EDIT FORM based on type */}
                        <BlockInput block={block} onChange={(content) => updateBlock(block.id, content)} />
                    </div>
                ))}
            </div>

            {/* ADD BLOCK BUTTONS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.5rem', background: '#111', padding: '1rem', border: '1px dashed #444' }}>
                <p style={{ gridColumn: '1 / -1', color: '#888', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Ajouter un bloc :</p>
                {BLOCK_TYPES.map(type => (
                    <button
                        key={type.type}
                        type="button"
                        onClick={() => addBlock(type.type)}
                        style={{ padding: '0.5rem', background: '#222', border: '1px solid #333', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}
                    >
                        <span>{type.icon}</span> {type.label}
                    </button>
                ))}
            </div>

        </div>
    );
};

// --- HELPER: Default Content ---
const getDefaultContent = (type) => {
    switch (type) {
        case 'text': return '';
        case 'title': return '';
        case 'statement': return '';
        case 'full-image': return { url: '', caption: '' };
        case 'image-caption': return { url: '', caption: '' };
        case 'gallery': return { images: [] }; // Array of URLs
        case 'video': return { url: '' };
        case 'quote': return { text: '', author: '' };
        case 'checklist': return { items: [] }; // Array of { text, done }
        case 'link': return { text: '', url: '' };
        case 'timeline': return { events: [] }; // { date, title, description }
        case 'steps': return { steps: [] }; // { title, description }
        case 'before-after': return { before: '', after: '' };
        case 'note': return { title: '', text: '', type: 'info' };
        case 'download': return { label: 'Télécharger', url: '', info: 'PDF, 2MB' };
        default: return {};
    }
};

// --- SUB-COMPONENT: Inputs for each block type ---
const BlockInput = ({ block, onChange }) => {
    const inputStyle = { width: '100%', padding: '0.5rem', background: '#0a0a0a', border: '1px solid #333', color: '#fff' };

    switch (block.type) {
        case 'text':
            return <textarea rows="4" value={block.content} onChange={e => onChange(e.target.value)} style={inputStyle} placeholder="Texte du paragraphe..." />;

        case 'title':
            return <input type="text" value={block.content} onChange={e => onChange(e.target.value)} style={inputStyle} placeholder="Titre de section..." />;

        case 'statement':
            return <textarea rows="2" value={block.content} onChange={e => onChange(e.target.value)} style={{ ...inputStyle, fontSize: '1.2rem' }} placeholder="Phrase choc / Statement..." />;

        case 'full-image':
            return (
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                    <input type="text" value={block.content.url} onChange={e => onChange({ ...block.content, url: e.target.value })} style={inputStyle} placeholder="URL de l'image" />
                    <input type="text" value={block.content.caption} onChange={e => onChange({ ...block.content, caption: e.target.value })} style={inputStyle} placeholder="Légende (optionnelle)" />
                </div>
            );

        case 'image-caption':
            return (
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                    <input type="text" value={block.content.url} onChange={e => onChange({ ...block.content, url: e.target.value })} style={inputStyle} placeholder="URL de l'image" />
                    <textarea rows="2" value={block.content.caption} onChange={e => onChange({ ...block.content, caption: e.target.value })} style={inputStyle} placeholder="Légende / Texte explicatif" />
                </div>
            );

        case 'video':
            return <input type="text" value={block.content.url} onChange={e => onChange({ ...block.content, url: e.target.value })} style={inputStyle} placeholder="URL Embed Vidéo (Youtube/Vimeo)..." />;

        case 'quote':
            return (
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                    <textarea rows="2" value={block.content.text} onChange={e => onChange({ ...block.content, text: e.target.value })} style={inputStyle} placeholder="Citation..." />
                    <input type="text" value={block.content.author} onChange={e => onChange({ ...block.content, author: e.target.value })} style={inputStyle} placeholder="Auteur" />
                </div>
            );

        case 'link':
            return (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input type="text" value={block.content.text} onChange={e => onChange({ ...block.content, text: e.target.value })} style={inputStyle} placeholder="Texte du bouton" />
                    <input type="text" value={block.content.url} onChange={e => onChange({ ...block.content, url: e.target.value })} style={inputStyle} placeholder="URL (https://...)" />
                </div>
            );

        case 'gallery':
            // Simple comma-separated list for now, or add/remove inputs
            const imagesStr = block.content.images ? block.content.images.join('\n') : '';
            return (
                <div>
                    <textarea
                        rows="3"
                        value={imagesStr}
                        onChange={e => onChange({ ...block.content, images: e.target.value.split('\n') })}
                        style={inputStyle}
                        placeholder="URLs des images (une par ligne)"
                    />
                    <p style={{ fontSize: '0.8rem', color: '#666' }}>Une URL par ligne</p>
                </div>
            );

        case 'checklist':
            // Advanced: Manage list of items
            const addItem = () => onChange({ ...block.content, items: [...(block.content.items || []), { text: '', done: false }] });
            const updateItem = (idx, field, val) => {
                const newItems = [...block.content.items];
                newItems[idx] = { ...newItems[idx], [field]: val };
                onChange({ ...block.content, items: newItems });
            };
            const removeItem = (idx) => onChange({ ...block.content, items: block.content.items.filter((_, i) => i !== idx) });

            return (
                <div>
                    {(block.content.items || []).map((item, i) => (
                        <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <input type="checkbox" checked={item.done} onChange={e => updateItem(i, 'done', e.target.checked)} />
                            <input type="text" value={item.text} onChange={e => updateItem(i, 'text', e.target.value)} style={inputStyle} placeholder="Tâche..." />
                            <button type="button" onClick={() => removeItem(i)} style={{ color: 'red', background: 'none', border: 'none' }}>x</button>
                        </div>
                    ))}
                    <button type="button" onClick={addItem} style={{ fontSize: '0.8rem', color: 'var(--color-accent)', background: 'none', border: 'none', cursor: 'pointer' }}>+ Ajouter un item</button>
                </div>
            );

        case 'separator':
            return <div style={{ height: '1px', background: '#333', margin: '1rem 0' }} />;

        case 'timeline':
            // Manage list of events
            const addEvent = () => onChange({ ...block.content, events: [...(block.content.events || []), { date: '', title: '', description: '' }] });
            const updateEvent = (idx, field, val) => {
                const newItems = [...block.content.events];
                newItems[idx] = { ...newItems[idx], [field]: val };
                onChange({ ...block.content, events: newItems });
            };
            const removeEvent = (idx) => onChange({ ...block.content, events: block.content.events.filter((_, i) => i !== idx) });

            return (
                <div>
                    {(block.content.events || []).map((ev, i) => (
                        <div key={i} style={{ padding: '0.5rem', background: '#222', marginBottom: '0.5rem', borderLeft: '2px solid #555' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <input type="text" value={ev.date} onChange={e => updateEvent(i, 'date', e.target.value)} style={inputStyle} placeholder="Date / Année" />
                                <input type="text" value={ev.title} onChange={e => updateEvent(i, 'title', e.target.value)} style={inputStyle} placeholder="Titre de l'événement" />
                            </div>
                            <textarea rows="2" value={ev.description} onChange={e => updateEvent(i, 'description', e.target.value)} style={inputStyle} placeholder="Description..." />
                            <button type="button" onClick={() => removeEvent(i)} style={{ color: 'red', font: '0.8rem', marginTop: '0.2rem', background: 'none', border: 'none' }}>Supprimer l'événement</button>
                        </div>
                    ))}
                    <button type="button" onClick={addEvent} style={{ fontSize: '0.8rem', color: 'var(--color-accent)', background: 'none', border: 'none', cursor: 'pointer' }}>+ Ajouter événement</button>
                </div>
            );

        case 'steps':
            const addStep = () => onChange({ ...block.content, steps: [...(block.content.steps || []), { title: '', description: '' }] });
            const updateStep = (idx, field, val) => {
                const newItems = [...block.content.steps];
                newItems[idx] = { ...newItems[idx], [field]: val };
                onChange({ ...block.content, steps: newItems });
            };
            const removeStep = (idx) => onChange({ ...block.content, steps: block.content.steps.filter((_, i) => i !== idx) });

            return (
                <div>
                    {(block.content.steps || []).map((st, i) => (
                        <div key={i} style={{ padding: '0.5rem', background: '#222', marginBottom: '0.5rem', borderLeft: '2px solid var(--color-accent)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <span style={{ fontWeight: 'bold' }}>{i + 1}.</span>
                                <input type="text" value={st.title} onChange={e => updateStep(i, 'title', e.target.value)} style={inputStyle} placeholder="Titre de l'étape" />
                            </div>
                            <textarea rows="2" value={st.description} onChange={e => updateStep(i, 'description', e.target.value)} style={inputStyle} placeholder="Détails..." />
                            <button type="button" onClick={() => removeStep(i)} style={{ color: 'red', font: '0.8rem', marginTop: '0.2rem', background: 'none', border: 'none' }}>Supprimer l'étape</button>
                        </div>
                    ))}
                    <button type="button" onClick={addStep} style={{ fontSize: '0.8rem', color: 'var(--color-accent)', background: 'none', border: 'none', cursor: 'pointer' }}>+ Ajouter étape</button>
                </div>
            );

        case 'before-after':
            return (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    <div>
                        <label style={{ color: '#888', fontSize: '0.8rem' }}>Image AVANT (URL)</label>
                        <input type="text" value={block.content.before} onChange={e => onChange({ ...block.content, before: e.target.value })} style={inputStyle} />
                    </div>
                    <div>
                        <label style={{ color: '#888', fontSize: '0.8rem' }}>Image APRÈS (URL)</label>
                        <input type="text" value={block.content.after} onChange={e => onChange({ ...block.content, after: e.target.value })} style={inputStyle} />
                    </div>
                </div>
            );

        case 'note':
            return (
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <select value={block.content.type} onChange={e => onChange({ ...block.content, type: e.target.value })} style={inputStyle}>
                            <option value="info">Information (Teal)</option>
                            <option value="warning">Attention (Orange)</option>
                        </select>
                        <input type="text" value={block.content.title} onChange={e => onChange({ ...block.content, title: e.target.value })} style={inputStyle} placeholder="Titre de la note" />
                    </div>
                    <textarea rows="3" value={block.content.text} onChange={e => onChange({ ...block.content, text: e.target.value })} style={inputStyle} placeholder="Contenu de la note..." />
                </div>
            );

        case 'download':
            return (
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                    <input type="text" value={block.content.label} onChange={e => onChange({ ...block.content, label: e.target.value })} style={inputStyle} placeholder="Label (ex: Télécharger PDF)" />
                    <input type="text" value={block.content.info} onChange={e => onChange({ ...block.content, info: e.target.value })} style={inputStyle} placeholder="Info (ex: 2.5MB)" />
                    <input type="text" value={block.content.url} onChange={e => onChange({ ...block.content, url: e.target.value })} style={inputStyle} placeholder="URL du fichier" />
                </div>
            );

        default:
            return <div style={{ color: '#666' }}>Pas d'options pour ce bloc.</div>;
    }
};

const actionBtnStyle = {
    background: 'none',
    border: '1px solid #444',
    color: '#ccc',
    padding: '0.2rem 0.5rem',
    cursor: 'pointer',
    borderRadius: '3px',
    fontSize: '0.8rem'
};

export default BlockEditor;
