import SEO from '../components/SEO';
import { Users, Target, ShieldCheck } from 'lucide-react';
import './About.css';

const About = () => {
    return (
        <div className="page page-about">
            <SEO
                title="À Propos"
                description="Découvrez l'histoire de Rustikop, notre mission et l'équipe passionnée derrière vos projets digitaux."
                url="/about"
            />

            <section className="about-hero">
                <div className="container">
                    <h1>Notre Histoire & <span className="text-accent">Vision</span></h1>
                    <p className="lead">
                        Né de la passion pour le design brut et la technologie de pointe, Rustikop fusionne l'authenticité artisanale avec la puissance du numérique.
                    </p>
                </div>
            </section>

            <section className="about-values">
                <div className="container">
                    <div className="values-grid">
                        <div className="value-card">
                            <Target size={40} className="value-icon" />
                            <h3>Innovation</h3>
                            <p>Nous repoussons constamment les limites du web pour créer des expériences uniques et mémorables.</p>
                        </div>
                        <div className="value-card">
                            <Users size={40} className="value-icon" />
                            <h3>Collaboration</h3>
                            <p>Votre vision est au cœur de notre processus. Nous co-créons avec vous à chaque étape.</p>
                        </div>
                        <div className="value-card">
                            <ShieldCheck size={40} className="value-icon" />
                            <h3>Qualité</h3>
                            <p>Pas de compromis. Du code propre, des designs pixel-perfect et une performance optimale.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="about-team">
                <div className="container">
                    <h2>L'Équipe</h2>
                    <p>Un collectif de créatifs, développeurs et stratèges.</p>
                    {/* Placeholder for team members */}
                    <div className="team-grid">
                        <div className="team-member">
                            <div className="member-avatar">R</div>
                            <h4>Rustik</h4>
                            <span>Fondateur & Lead Dev</span>
                        </div>
                        {/* More members via CMS later */}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;
