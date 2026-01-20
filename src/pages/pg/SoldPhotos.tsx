import React from 'react';
import { usePhotographer } from '../../context/PhotographerContext';
import { MasonryGrid } from '../../components/MasonryGrid';
import { PgPhotoCard } from './PgPhotoCard';
import { DollarSign } from 'lucide-react';

export const SoldPhotos: React.FC = () => {
    const { events, getPhotosByEvent } = usePhotographer();

    // Flatten all photos and filter for sold ones
    const allSoldPhotos = events.flatMap(e => getPhotosByEvent(e.id)).filter(p => p.soldCount > 0);

    return (
        <div className="pg-sold-photos">
            <header style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0 0 8px 0' }}>Sold Photos</h1>
                <p style={{ color: '#666', margin: 0 }}>View all photos that have been purchased by customers.</p>
            </header>

            {allSoldPhotos.length > 0 ? (
                <MasonryGrid isLoading={false}>
                    {allSoldPhotos.map(photo => (
                        <PgPhotoCard
                            key={photo.id}
                            photo={photo}
                            isSelected={false}
                            onToggleSelect={() => { }} // No selection in this view for now
                        />
                    ))}
                </MasonryGrid>
            ) : (
                <div style={{
                    padding: '80px 20px',
                    textAlign: 'center',
                    background: '#fff',
                    borderRadius: '16px',
                    border: '1px solid #eaeaea'
                }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        background: '#f0fdf4',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px'
                    }}>
                        <DollarSign size={32} color="#10b981" />
                    </div>
                    <h3 style={{ margin: '0 0 8px 0' }}>No sales yet</h3>
                    <p style={{ color: '#666', margin: 0 }}>Your sold photos will appear here once customers make a purchase.</p>
                </div>
            )}
        </div>
    );
};
