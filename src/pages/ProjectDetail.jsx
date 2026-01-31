import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import BlockRenderer from '../components/BlockRenderer';
import Breadcrumbs from '../components/Breadcrumbs';
import DOMPurify from 'dompurify';
import * as LucideIcons from 'lucide-react';

const ProjectDetail = () => {
    const { id } = useParams();
    const { projects } = useData();
    const project = projects.find(p => p.id === parseInt(id));
    const navigate = useNavigate();

    if (!project) return <div className="container" style={{ paddingTop: 'calc(140px + var(--banner-height, 0px))' }}>Projet introuvable</div>;

    // Check if project image is a Lucide icon
    const isLucideIcon = project.image && project.image.startsWith('lucide:');
    const iconName = isLucideIcon ? project.image.replace('lucide:', '').split('?')[0] : null;
    const IconComponent = iconName ? LucideIcons[iconName] : null;

    return (
        <div className="page" style={{ paddingTop: 'calc(140px + var(--banner-height, 0px))', minHeight: '100vh' }}>
            <div className="container">
                <Breadcrumbs lastItemName={project.title} />
                <h1 style={{ fontSize: '4rem', marginBottom: '1rem' }}>{project.title}</h1>
                <span style={{ color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{project.category}</span>

                {isLucideIcon && IconComponent ? (
                    <div style={{
                        width: '100%',
                        height: '400px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, var(--color-bg-dark) 0%, var(--color-bg) 100%)',
                        borderRadius: '12px',
                        margin: '3rem 0'
                    }}>
                        <IconComponent size={200} color="var(--color-accent)" strokeWidth={1.5} />
                    </div>
                ) : (
                    <img src={project.image} alt={project.title} style={{ width: '100%', height: '600px', objectFit: 'cover', margin: '3rem 0' }} />
                )}

                <div className="project-content" style={{ maxWidth: '100%', margin: '0 auto', fontSize: '1.2rem', lineHeight: '1.8' }}>

                    {/* Render Blocks if available, else Legacy HTML */}
                    {project.blocks && project.blocks.length > 0 ? (
                        <BlockRenderer blocks={project.blocks} />
                    ) : (
                        <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(project.content || '<p>Aucun contenu supplémentaire.</p>') }} style={{ maxWidth: '800px', margin: '0 auto' }} />
                    )}

                </div>
            </div>
        </div>
    );
};

export default ProjectDetail;
