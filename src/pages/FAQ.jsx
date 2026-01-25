import { useState } from 'react';
import SEO from '../components/SEO';
import { ChevronDown, ChevronUp } from 'lucide-react';
import './FAQ.css';

const FAQ = () => {
    const [activeIndex, setActiveIndex] = useState(null);

    const faqs = [
        {
            question: "Quels types de projets réalisez-vous ?",
            answer: "Nous sommes spécialisés dans la création de sites web immersifs, d'identités visuelles (branding) et d'applications interactives. Que ce soit pour un portfolio d'artiste, une boutique e-commerce ou une plateforme d'entreprise, nous apportons une touche unique."
        },
        {
            question: "Combien de temps prend la création d'un site ?",
            answer: "Cela dépend de la complexité du projet. Un site vitrine prend généralement 2 à 4 semaines, tandis qu'une plateforme e-commerce complète peut nécessiter 6 à 10 semaines. Nous définissons un planning précis dès le début du projet."
        },
        {
            question: "Proposez-vous un service de maintenance ?",
            answer: "Absolument. Nous offrons des forfaits de maintenance pour assurer la sécurité, les mises à jour et les performances de votre site sur le long terme."
        },
        {
            question: "Puis-je modifier le contenu de mon site moi-même ?",
            answer: "Oui, tous nos sites sont livrés avec une interface d'administration intuitive (comme celle de ce site !) vous permettant de gérer vos textes, images et produits en toute autonomie."
        }
    ];

    const toggleFAQ = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    // Handle mouse move for cursor glow effect
    const handleMouseMove = (e) => {
        const item = e.currentTarget;
        const rect = item.getBoundingClientRect();
        item.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
        item.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
    };

    return (
        <div className="page page-faq">
            <SEO
                title="FAQ"
                description="Réponses aux questions fréquentes sur nos services de design et développement web."
                url="/faq"
            />

            <div className="container">
                <h1 className="page-title">Foire Aux Questions</h1>
                <div className="faq-list">
                    {faqs.map((faq, index) => (
                        <div 
                            key={index} 
                            className={`faq-item ${activeIndex === index ? 'active' : ''}`}
                            onMouseMove={handleMouseMove}
                        >
                            <button className="faq-question" onClick={() => toggleFAQ(index)}>
                                <span>{faq.question}</span>
                                {activeIndex === index ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </button>
                            <div className="faq-answer">
                                <p>{faq.answer}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FAQ;
