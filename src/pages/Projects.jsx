import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { WEBSITE_VERSION } from '../version';
import LazyImage from '../components/LazyImage';
import './Projects.css';

const Projects = () => {
    const { projects } = useData();

    return (
        <div className="page page-projects">
            <div className="container">
                <h1 className="page-title">Projets Sélectionnés</h1>
                <div className="grid-projects">
                    {projects.map((project) => (
                        <Link to={`/projects/${project.id}`} key={project.id} className="project-card">
                            <div className="project-image-container">
                                <LazyImage src={`${project.image}?v=${WEBSITE_VERSION}`} alt={project.title} className="project-image" />
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
