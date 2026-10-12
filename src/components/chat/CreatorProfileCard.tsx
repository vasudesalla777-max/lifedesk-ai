import React from 'react';
import { ExternalLink, Github, Twitter, Globe, Mail, Star, Zap } from 'lucide-react';
import { CREATOR_CONFIG, getCreatorPhoto } from '../../config/creatorConfig';
import { useAuth } from '../../context/AuthContext';

interface CreatorProfileCardProps {
  compact?: boolean;
  photoUrl?: string;
}

export const CreatorProfileCard: React.FC<CreatorProfileCardProps> = ({ compact = false, photoUrl }) => {
  const { user } = useAuth();
  const photo = photoUrl || getCreatorPhoto(user?.avatar_url);

  const handlePhotoError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const el = e.currentTarget;
    if (el.src !== CREATOR_CONFIG.photoUrl) {
      el.src = CREATOR_CONFIG.photoUrl;
    } else {
      el.style.display = 'none';
    }
  };

  const socialLinks = [
    { icon: <Github size={14} />, label: 'GitHub',  href: CREATOR_CONFIG.social?.github  },
    { icon: <Twitter size={14} />, label: 'Twitter', href: CREATOR_CONFIG.social?.twitter },
    { icon: <Globe size={14} />,   label: 'Website', href: CREATOR_CONFIG.social?.website },
    { icon: <Mail size={14} />,    label: 'Email',   href: CREATOR_CONFIG.social?.email ? `mailto:${CREATOR_CONFIG.social.email}` : undefined },
  ].filter(l => l.href);

  if (compact) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        padding: '0.75rem 1rem',
        background: 'rgba(139,92,246,0.08)',
        borderRadius: '12px',
        border: '1px solid rgba(139,92,246,0.15)',
      }}>
        {photo ? (
          <img src={photo} alt={CREATOR_CONFIG.name} onError={handlePhotoError}
            style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
        ) : (
          <div style={{
            width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg,#8b5cf6,#06b6d4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.875rem', fontWeight: 700, color: '#fff',
          }}>
            {CREATOR_CONFIG.name?.charAt(0) ?? 'C'}
          </div>
        )}
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#e2e8f0', margin: 0 }}>
            {CREATOR_CONFIG.name}
          </p>
          <p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: 0 }}>
            {CREATOR_CONFIG.role ?? 'Creator'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(6,182,212,0.08) 100%)',
      border: '1px solid rgba(139,92,246,0.2)',
      borderRadius: '16px',
      padding: '1.5rem',
      display: 'flex', flexDirection: 'column', gap: '1rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          {photo ? (
            <img src={photo} alt={CREATOR_CONFIG.name} onError={handlePhotoError}
              style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover',
                border: '2px solid rgba(139,92,246,0.4)' }} />
          ) : (
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'linear-gradient(135deg,#8b5cf6,#06b6d4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.25rem', fontWeight: 700, color: '#fff',
            }}>
              {CREATOR_CONFIG.name?.charAt(0) ?? 'C'}
            </div>
          )}
          <div style={{
            position: 'absolute', bottom: 0, right: 0,
            width: 14, height: 14, borderRadius: '50%',
            background: '#22c55e', border: '2px solid #0f172a',
          }} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#f1f5f9' }}>{CREATOR_CONFIG.name}</h3>
            <Star size={12} style={{ color: '#f59e0b', fill: '#f59e0b' }} />
          </div>
          <p style={{ margin: '0.1rem 0 0', fontSize: '0.78rem', color: '#8b5cf6', fontWeight: 500 }}>
            {CREATOR_CONFIG.role ?? 'Creator'}
          </p>
        </div>
      </div>

      {CREATOR_CONFIG.bio && (
        <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.6 }}>{CREATOR_CONFIG.bio}</p>
      )}

      {CREATOR_CONFIG.tags && CREATOR_CONFIG.tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {CREATOR_CONFIG.tags.map((tag: string) => (
            <span key={tag} style={{
              fontSize: '0.68rem', fontWeight: 600,
              padding: '0.2rem 0.6rem', borderRadius: '999px',
              background: 'rgba(139,92,246,0.15)', color: '#a78bfa',
              border: '1px solid rgba(139,92,246,0.25)',
            }}>{tag}</span>
          ))}
        </div>
      )}

      {socialLinks.length > 0 && (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {socialLinks.map(link => (
            <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                fontSize: '0.72rem', fontWeight: 500,
                padding: '0.3rem 0.7rem', borderRadius: '8px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#cbd5e1', textDecoration: 'none', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background='rgba(139,92,246,0.2)'; el.style.color='#a78bfa'; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background='rgba(255,255,255,0.05)'; el.style.color='#cbd5e1'; }}
            >
              {link.icon} {link.label} <ExternalLink size={10} />
            </a>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: '0.7rem', color: '#475569' }}>
        <Zap size={11} style={{ color: '#8b5cf6' }} /> Built with LifeDesk AI
      </div>
    </div>
  );
};

export default CreatorProfileCard;
