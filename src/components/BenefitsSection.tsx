import { ShieldCheck, LayoutDashboard, Settings } from 'lucide-react';
import './BenefitsSection.css';

export const BenefitsSection: React.FC = () => {
    const benefits = [
        {
            icon: <LayoutDashboard size={24} />,
            title: "Easy to find your photos",
            body: "Search by competition and browse galleries smoothly."
        },
        {
            icon: <ShieldCheck size={24} />,
            title: "Secure payment & instant delivery",
            body: "Pay online and download your images immediately."
        },
        {
            icon: <Settings size={24} />,
            title: "All-in-one for photographers",
            body: "Bookings, uploads, orders and receipts in one place."
        }
    ];

    return (
        <section className="benefits-section">
            <div className="container">
                <div className="benefits-grid">
                    {benefits.map((benefit, index) => (
                        <div key={index} className="benefit-item">
                            <div className="benefit-icon-wrapper">
                                {benefit.icon}
                            </div>
                            <div className="benefit-content">
                                <h3 className="benefit-title">{benefit.title}</h3>
                                <p className="benefit-body">{benefit.body}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="benefits-divider"></div>
            </div>
        </section>
    );
};
