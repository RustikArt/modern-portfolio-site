import './Home.css';

const Home = () => {
    return (
        <div className="page-home">
            <section className="hero">
                <div className="container">
                    <h1 className="hero-title">
                        <span className="block-reveal">Toutes les faces de l'art</span>
                        <br />
                        <span className="block-reveal">réunies.</span>
                    </h1>
                    <p className="hero-subtitle">Design numérique & Expériences immersives.</p>
                    <a href="/projects" className="btn btn-primary">Voir les projets</a>
                </div>
            </section>

            <section className="about">
                <div className="container">
                    <h2>La polyvalence de l'art.</h2>
                    <p>L'art est complexe, nos artistes aussi. Des artistes spécialisés chacun dans leur domaine sont prêt pour vous aider à créer des projets uniques et captivants.</p>
                </div>
            </section>
        </div>
    );
};

export default Home;
