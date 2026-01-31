
// Simulation of an Email Service
// In a real app, this would call a backend API (SendGrid, AWS SES, etc.)

export const sendOrderConfirmation = (order) => {
    // Simulate API delay
    return new Promise(resolve => setTimeout(resolve, 500));
};

export const sendShippingUpdate = (order, trackingNumber) => {
    return new Promise(resolve => setTimeout(resolve, 500));
};

export const sendVideoProof = (order, videoUrl) => {
    return new Promise(resolve => setTimeout(resolve, 500));
}
