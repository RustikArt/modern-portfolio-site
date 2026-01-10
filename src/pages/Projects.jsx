import { useData } from '../context/DataContext';
import { Link } from 'react-router-dom';
import { WEBSITE_VERSION } from '../version';
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
                                <img src={`${project.image}?v=${WEBSITE_VERSION}`} alt={project.title} className="project-image" />
                                <div className="project-overlay">
                                    <h3>{project.title}</h3>
                                    <span>{project.category}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Projects;
