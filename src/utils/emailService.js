
// Simulation of an Email Service
// In a real app, this would call a backend API (SendGrid, AWS SES, etc.)

export const sendOrderConfirmation = (order) => {
    console.log(`
    📧 [EMAIL SIMULATION] Sending Order Confirmation to: ${order.email}
    Subject: Confirmation de commande #${order.id}
    
    Bonjour ${order.customerName},
    Merci pour votre commande de ${order.total}€.
    Nous allons commencer le traitement dès que possible.
    
    Articles:
    ${order.items.map(i => `- ${i.name} (x${i.quantity})`).join('\n')}
    
    Checklist de production:
    [ ] Brief client reçu
    [ ] Concept validé
    [ ] Production
    [ ] Expédition
    `);

    // Simulate API delay
    return new Promise(resolve => setTimeout(resolve, 500));
};

export const sendShippingUpdate = (order, trackingNumber) => {
    console.log(`
    📧 [EMAIL SIMULATION] Shipping Update for Order #${order.id}
    To: ${order.email}
    Subject: Votre commande est en route ! 🚀
    
    Bonne nouvelle ! Votre commande a été expédiée.
    Numéro de suivi: ${trackingNumber || 'Non disponible'}
    
    Merci de votre confiance.
    `);
    return new Promise(resolve => setTimeout(resolve, 500));
};

export const sendVideoProof = (order, videoUrl) => {
    console.log(`
    📧 [EMAIL SIMULATION] Video Proof for Order #${order.id}
    To: ${order.email}
    Subject: Preuve vidéo de votre commande 🎥
    
    Votre commande est prête ! Voici une vidéo avant l'expédition :
    ${videoUrl}
    
    Si tout est bon, nous procédons à l'envoi.
    `);
    return new Promise(resolve => setTimeout(resolve, 500));
}
