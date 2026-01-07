import './Contact.css';

const Contact = () => {
    return (
        <div className="page page-contact">
            <div className="container contact-container">
                <div className="contact-info">
                    <h1>Parlons de votre projet.</h1>
                    <p>Disponible pour des missions en freelance.<br />Transformons vos idées en expériences digitales.</p>
                    <div className="contact-details">
                        <p>hello@portfolio.design</p>
                    </div>
                </div>

                <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
                    <div className="form-group">
                        <label htmlFor="name">Nom</label>
                        <input type="text" id="name" placeholder="Votre nom" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input type="email" id="email" placeholder="votre@email.com" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="message">Message</label>
                        <textarea id="message" rows="5" placeholder="Parlez-moi de votre projet..."></textarea>
                    </div>
                    <button type="submit" className="btn btn-primary">Envoyer</button>
                </form>
            </div>
        </div>
    );
};

export default Contact;
