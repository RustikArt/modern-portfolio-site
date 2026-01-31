import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { WEBSITE_VERSION } from '../version';
import LazyImage from '../components/LazyImage';
import * as LucideIcons from 'lucide-react';
import './Projects.css';

const Projects = () => {
    const { projects } = useData();

    // Render Lucide icon or image
    const renderProjectImage = (project) => {
        const isLucideIcon = project.image && project.image.startsWith('lucide:');
        
        if (isLucideIcon) {
            const iconName = project.image.replace('lucide:', '').split('?')[0];
            const IconComponent = LucideIcons[iconName];
            
            if (IconComponent) {
                return (
                    <div className="project-image lucide-icon-container" style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(135deg, var(--color-bg-dark) 0%, var(--color-bg) 100%)'
                    }}>
                        <IconComponent size={120} color="var(--color-accent)" strokeWidth={1.5} />
                    </div>
                );
            }
        }
        
        return <LazyImage src={`${project.image}?v=${WEBSITE_VERSION}`} alt={project.title} className="project-image" />;
    };

    return (
        <div className="page page-projects">
            <div className="container">
                <h1 className="page-title">Projets Sélectionnés</h1>
                <div className="grid-projects">
                    {projects.map((project) => (
                        <Link to={`/projects/${project.id}`} key={project.id} className="project-card">
                            <div className="project-image-container">
                                {renderProjectImage(project)}
                                <div className="project-overlay">
                                    <span className="view-project">Voir le projet</span>
                                </div>
                            </div>
                            <div className="project-info">
                                <h3>{project.title}</h3>
                                <span>{project.category}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Projects;
