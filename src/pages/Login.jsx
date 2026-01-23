import { useState } from 'react';
import { useData } from '../context/DataContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');

    const { login, register, addNotification } = useData();
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);

    const handleAuth = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                const result = await login(email, password);
                if (result.success) {
                    navigate('/');
                } else {
                    setError(result.message);
                    try { addNotification('account', `Échec connexion : ${result.message}`); } catch (e) {}
                }
            } else {
                const result = await register(email, password, name);
                if (result.success) {
                    navigate('/');
                } else {
                    setError(result.message);
                    try { addNotification('account', `Inscription échouée : ${result.message}`); } catch (e) {}
                }
            }
        } catch (e) {
            console.error('Auth handler error:', e);
            setError('Erreur inattendue.');
            try { addNotification('account', 'Erreur inattendue lors de l\'authentification.'); } catch (err) {}
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page page-login" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', paddingTop: '80px' }}>
            <div style={{ width: '100%', maxWidth: '400px', padding: '2rem', background: 'var(--color-surface)', borderRadius: '4px' }}>
                <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                    {isLogin ? 'Connexion' : 'Inscription'}
                </h2>

                <form onSubmit={handleAuth}>
                    {!isLogin && (
                        <div className="form-group">
                            <label htmlFor="name">Nom</label>
                            <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Mot de passe</label>
                        <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>

                    {error && <p style={{ color: 'red', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</p>}

                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Connexion…' : (isLogin ? 'Se connecter' : "S'inscrire")}
                    </button>
                </form>

                <p style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.9rem', color: '#888' }}>
                    {isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"}
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        style={{ background: 'none', border: 'none', color: 'var(--color-accent)', cursor: 'pointer', marginLeft: '0.5rem', textDecoration: 'underline' }}
                    >
                        {isLogin ? "Créer un compte" : "Se connecter"}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Login;
