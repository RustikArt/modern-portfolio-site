import { useState, useRef } from 'react';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import {
    Sparkles,
    Send,
    Upload,
    X,
    CheckCircle2,
    Clock,
    MessageSquare,
    Palette,
    Code,
    Video,
    PenTool,
    BarChart3,
    FileText,
    ArrowRight,
    AlertCircle,
    Loader2,
    Star,
    Shield,
    Zap,
    Heart
} from 'lucide-react';
import './CustomOrder.css';

const SERVICE_TYPES = [
    { id: 'website', label: 'Site Web / Application', icon: Code, description: 'Site vitrine, e-commerce, application web' },
    { id: 'design', label: 'Design / Graphisme', icon: Palette, description: 'Logo, identité visuelle, supports print' },
    { id: 'video', label: 'Vidéo / Animation', icon: Video, description: 'Montage, motion design, intro' },
    { id: 'illustration', label: 'Illustration', icon: PenTool, description: 'Illustration personnalisée, portraits' },
    { id: 'marketing', label: 'Marketing / Réseaux', icon: BarChart3, description: 'Stratégie, gestion réseaux, publicité' },
    { id: 'content', label: 'Rédaction / Contenu', icon: FileText, description: 'Articles, copywriting, SEO' },
    { id: 'other', label: 'Autre projet', icon: Sparkles, description: 'Projet spécial ou multi-domaines' }
];

const BUDGET_RANGES = [
    { id: 'small', label: 'Petit budget', range: '< 100€', description: 'Projets simples et rapides' },
    { id: 'medium', label: 'Budget moyen', range: '100€ - 300€', description: 'Projets standards' },
    { id: 'large', label: 'Budget confortable', range: '300€ - 1000€', description: 'Projets complets' },
    { id: 'premium', label: 'Sur mesure', range: '> 1000€', description: 'Projets d\'envergure' },
    { id: 'unknown', label: 'À définir', range: 'À discuter', description: 'Besoin de conseils' }
];

const TIMELINE_OPTIONS = [
    { id: 'urgent', label: 'Urgent', time: '< 1 semaine', icon: Zap },
    { id: 'normal', label: 'Normal', time: '1-2 semaines', icon: Clock },
    { id: 'relaxed', label: 'Flexible', time: '2-4 semaines', icon: Heart },
    { id: 'planning', label: 'Long terme', time: '> 1 mois', icon: Star }
];

const CustomOrder = () => {
    const { currentUser, submitCustomOrder, settings } = useData();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        serviceType: '',
        title: '',
        description: '',
        budget: '',
        timeline: '',
        references: '',
        attachments: [],
        contactPreference: 'email',
        additionalNotes: ''
    });

    // Check if user is logged in
    if (!currentUser) {
        return (
            <div className="page page-custom-order">
                <div className="container">
                    <div className="custom-order-login-prompt">
                        <div className="prompt-icon">
                            <AlertCircle size={48} />
                        </div>
                        <h2>Connexion requise</h2>
                        <p>Vous devez être connecté pour envoyer une demande de projet personnalisé.</p>
                        <button 
                            className="btn btn-primary"
                            onClick={() => navigate('/login', { state: { from: '/custom-order' } })}
                        >
                            Se connecter / S'inscrire <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);
        const maxFiles = 5;
        const maxSize = 5 * 1024 * 1024; // 5MB

        const validFiles = files.filter(file => {
            if (file.size > maxSize) {
                setError(`Le fichier ${file.name} dépasse 5MB`);
                return false;
            }
            return true;
        });

        if (formData.attachments.length + validFiles.length > maxFiles) {
            setError(`Maximum ${maxFiles} fichiers autorisés`);
            return;
        }

        // Convert to base64 for preview and storage
        validFiles.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({
                    ...prev,
                    attachments: [...prev.attachments, {
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        data: reader.result
                    }]
                }));
            };
            reader.readAsDataURL(file);
        });
    };

    const removeFile = (index) => {
        setFormData(prev => ({
            ...prev,
            attachments: prev.attachments.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async () => {
        setError('');
        setIsSubmitting(true);

        try {
            const orderData = {
                ...formData,
                userId: currentUser.id,
                userEmail: currentUser.email,
                userName: currentUser.name || currentUser.email.split('@')[0],
                createdAt: new Date().toISOString(),
                status: 'pending' // pending, reviewed, quoted, accepted, rejected, completed
            };

            await submitCustomOrder(orderData);
            setSubmitted(true);
        } catch (err) {
            setError(err.message || 'Une erreur est survenue. Veuillez réessayer.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const canProceed = () => {
        switch (step) {
            case 1: return formData.serviceType !== '';
            case 2: return formData.title.trim() !== '' && formData.description.trim().length >= 20;
            case 3: return formData.budget !== '' && formData.timeline !== '';
            default: return true;
        }
    };

    // Success screen
    if (submitted) {
        return (
            <div className="page page-custom-order">
                <div className="container">
                    <div className="custom-order-success">
                        <div className="success-animation">
                            <div className="success-circle">
                                <CheckCircle2 size={64} />
                            </div>
                        </div>
                        <h1>Demande envoyée !</h1>
                        <p className="success-subtitle">
                            Votre projet a bien été reçu. Je l'examine personnellement et vous 
                            recontacte sous <strong>24-48h</strong> avec une proposition détaillée.
                        </p>
                        
                        <div className="success-timeline">
                            <div className="timeline-step completed">
                                <div className="step-icon"><CheckCircle2 size={20} /></div>
                                <span>Demande reçue</span>
                            </div>
                            <div className="timeline-step">
                                <div className="step-icon"><MessageSquare size={20} /></div>
                                <span>Analyse en cours</span>
                            </div>
                            <div className="timeline-step">
                                <div className="step-icon"><FileText size={20} /></div>
                                <span>Devis personnalisé</span>
                            </div>
                        </div>

                        <div className="success-actions">
                            <button 
                                className="btn btn-primary"
                                onClick={() => navigate('/profile')}
                            >
                                Voir mes demandes <ArrowRight size={18} />
                            </button>
                            <button 
                                className="btn btn-secondary"
                                onClick={() => navigate('/shop')}
                            >
                                Voir la boutique
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page page-custom-order">
            <div className="container">
                {/* Header */}
                <div className="custom-order-header">
                    <div className="header-badge">
                        <Sparkles size={16} />
                        <span>Projet Sur-Mesure</span>
                    </div>
                    <h1>Créons ensemble <span>votre projet</span></h1>
                    <p>
                        Vous avez une idée précise ou besoin de conseils ? Décrivez votre projet 
                        et recevez une proposition personnalisée sous 24-48h.
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="progress-container">
                    <div className="progress-bar">
                        <div 
                            className="progress-fill" 
                            style={{ width: `${(step / 4) * 100}%` }}
                        />
                    </div>
                    <div className="progress-steps">
                        {['Type', 'Description', 'Budget', 'Finaliser'].map((label, i) => (
                            <div 
                                key={i} 
                                className={`progress-step ${step > i ? 'completed' : ''} ${step === i + 1 ? 'active' : ''}`}
                            >
                                <div className="step-number">{i + 1}</div>
                                <span>{label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form Steps */}
                <div className="custom-order-form">
                    {/* Step 1: Service Type */}
                    {step === 1 && (
                        <div className="form-step animate-in">
                            <h2>Quel type de projet avez-vous en tête ?</h2>
                            <p className="step-description">Sélectionnez la catégorie qui correspond le mieux à vos besoins</p>
                            
                            <div className="service-grid">
                                {SERVICE_TYPES.map(service => {
                                    const Icon = service.icon;
                                    return (
                                        <button
                                            key={service.id}
                                            className={`service-card ${formData.serviceType === service.id ? 'selected' : ''}`}
                                            onClick={() => setFormData(prev => ({ ...prev, serviceType: service.id }))}
                                        >
                                            <div className="service-icon">
                                                <Icon size={28} />
                                            </div>
                                            <h3>{service.label}</h3>
                                            <p>{service.description}</p>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Project Description */}
                    {step === 2 && (
                        <div className="form-step animate-in">
                            <h2>Décrivez votre projet</h2>
                            <p className="step-description">Plus vous êtes précis, plus ma proposition sera adaptée</p>
                            
                            <div className="form-group">
                                <label>Titre du projet *</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Refonte de mon site web, Logo pour ma marque..."
                                    value={formData.title}
                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    maxLength={100}
                                />
                                <span className="char-count">{formData.title.length}/100</span>
                            </div>

                            <div className="form-group">
                                <label>Description détaillée *</label>
                                <textarea
                                    placeholder="Décrivez votre projet en détail : contexte, objectifs, public cible, fonctionnalités souhaitées, inspirations..."
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    rows={6}
                                    minLength={20}
                                />
                                <span className="char-count">{formData.description.length} caractères (min. 20)</span>
                            </div>

                            <div className="form-group">
                                <label>Références / Inspirations (optionnel)</label>
                                <textarea
                                    placeholder="Partagez des liens ou décrivez des exemples qui vous inspirent..."
                                    value={formData.references}
                                    onChange={(e) => setFormData(prev => ({ ...prev, references: e.target.value }))}
                                    rows={3}
                                />
                            </div>

                            <div className="form-group">
                                <label>Fichiers joints (optionnel)</label>
                                <div 
                                    className="file-upload-zone"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Upload size={24} />
                                    <p>Cliquez ou glissez vos fichiers ici</p>
                                    <span>PNG, JPG, PDF, DOC - Max 5 fichiers, 5MB chacun</span>
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    accept=".png,.jpg,.jpeg,.pdf,.doc,.docx"
                                    onChange={handleFileUpload}
                                    style={{ display: 'none' }}
                                />
                                
                                {formData.attachments.length > 0 && (
                                    <div className="file-list">
                                        {formData.attachments.map((file, index) => (
                                            <div key={index} className="file-item">
                                                <FileText size={16} />
                                                <span>{file.name}</span>
                                                <button onClick={() => removeFile(index)}>
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Budget & Timeline */}
                    {step === 3 && (
                        <div className="form-step animate-in">
                            <h2>Budget et délais</h2>
                            <p className="step-description">Ces informations m'aident à vous proposer la meilleure solution</p>
                            
                            <div className="form-section">
                                <h3>Votre budget estimé</h3>
                                <div className="budget-grid">
                                    {BUDGET_RANGES.map(budget => (
                                        <button
                                            key={budget.id}
                                            className={`budget-card ${formData.budget === budget.id ? 'selected' : ''}`}
                                            onClick={() => setFormData(prev => ({ ...prev, budget: budget.id }))}
                                        >
                                            <span className="budget-range">{budget.range}</span>
                                            <span className="budget-label">{budget.label}</span>
                                            <span className="budget-desc">{budget.description}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="form-section">
                                <h3>Délai souhaité</h3>
                                <div className="timeline-grid">
                                    {TIMELINE_OPTIONS.map(option => {
                                        const Icon = option.icon;
                                        return (
                                            <button
                                                key={option.id}
                                                className={`timeline-card ${formData.timeline === option.id ? 'selected' : ''}`}
                                                onClick={() => setFormData(prev => ({ ...prev, timeline: option.id }))}
                                            >
                                                <Icon size={20} />
                                                <span className="timeline-label">{option.label}</span>
                                                <span className="timeline-time">{option.time}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Review & Submit */}
                    {step === 4 && (
                        <div className="form-step animate-in">
                            <h2>Récapitulatif de votre demande</h2>
                            <p className="step-description">Vérifiez les informations avant envoi</p>
                            
                            <div className="review-card">
                                <div className="review-section">
                                    <h4>Type de projet</h4>
                                    <p>{SERVICE_TYPES.find(s => s.id === formData.serviceType)?.label}</p>
                                </div>
                                
                                <div className="review-section">
                                    <h4>Titre</h4>
                                    <p>{formData.title}</p>
                                </div>
                                
                                <div className="review-section">
                                    <h4>Description</h4>
                                    <p className="review-description">{formData.description}</p>
                                </div>
                                
                                {formData.references && (
                                    <div className="review-section">
                                        <h4>Références</h4>
                                        <p>{formData.references}</p>
                                    </div>
                                )}
                                
                                <div className="review-row">
                                    <div className="review-section">
                                        <h4>Budget</h4>
                                        <p>{BUDGET_RANGES.find(b => b.id === formData.budget)?.range}</p>
                                    </div>
                                    <div className="review-section">
                                        <h4>Délai</h4>
                                        <p>{TIMELINE_OPTIONS.find(t => t.id === formData.timeline)?.time}</p>
                                    </div>
                                </div>
                                
                                {formData.attachments.length > 0 && (
                                    <div className="review-section">
                                        <h4>Fichiers joints</h4>
                                        <p>{formData.attachments.length} fichier(s)</p>
                                    </div>
                                )}
                            </div>

                            <div className="form-group">
                                <label>Notes supplémentaires (optionnel)</label>
                                <textarea
                                    placeholder="Quelque chose à ajouter ?"
                                    value={formData.additionalNotes}
                                    onChange={(e) => setFormData(prev => ({ ...prev, additionalNotes: e.target.value }))}
                                    rows={3}
                                />
                            </div>

                            <div className="contact-preference">
                                <label>Je préfère être contacté par :</label>
                                <div className="preference-options">
                                    <button
                                        className={formData.contactPreference === 'email' ? 'selected' : ''}
                                        onClick={() => setFormData(prev => ({ ...prev, contactPreference: 'email' }))}
                                    >
                                        Email
                                    </button>
                                    <button
                                        className={formData.contactPreference === 'phone' ? 'selected' : ''}
                                        onClick={() => setFormData(prev => ({ ...prev, contactPreference: 'phone' }))}
                                    >
                                        Téléphone
                                    </button>
                                </div>
                            </div>

                            <div className="trust-badges">
                                <div className="badge">
                                    <Shield size={18} />
                                    <span>Données sécurisées</span>
                                </div>
                                <div className="badge">
                                    <Clock size={18} />
                                    <span>Réponse sous 24-48h</span>
                                </div>
                                <div className="badge">
                                    <Star size={18} />
                                    <span>Sans engagement</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error Display */}
                    {error && (
                        <div className="form-error">
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="form-navigation">
                        {step > 1 && (
                            <button 
                                className="btn btn-secondary"
                                onClick={() => setStep(step - 1)}
                                disabled={isSubmitting}
                            >
                                Retour
                            </button>
                        )}
                        
                        {step < 4 ? (
                            <button 
                                className="btn btn-primary"
                                onClick={() => setStep(step + 1)}
                                disabled={!canProceed()}
                            >
                                Continuer <ArrowRight size={18} />
                            </button>
                        ) : (
                            <button 
                                className="btn btn-primary btn-submit"
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="spin" size={18} />
                                        Envoi en cours...
                                    </>
                                ) : (
                                    <>
                                        <Send size={18} />
                                        Envoyer ma demande
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* Side Info */}
                <div className="custom-order-info">
                    <div className="info-card">
                        <h3>💡 Comment ça marche ?</h3>
                        <ol>
                            <li><strong>Décrivez</strong> votre projet en détail</li>
                            <li><strong>Recevez</strong> un devis personnalisé sous 24-48h</li>
                            <li><strong>Validez</strong> et on commence ensemble !</li>
                        </ol>
                    </div>
                    
                    <div className="info-card highlight">
                        <h3>🎁 Avantages</h3>
                        <ul>
                            <li>✓ Devis gratuit et sans engagement</li>
                            <li>✓ Prix adapté à votre budget</li>
                            <li>✓ Accompagnement personnalisé</li>
                            <li>✓ Révisions incluses</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomOrder;
