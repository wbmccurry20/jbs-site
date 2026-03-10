import { useState, useEffect, useCallback } from 'react';

interface Project {
  title: string;
  category: string;
  location: string;
  images: string[];
}

const projects: Project[] = [
  {
    title: 'Mister Car Wash',
    category: 'Ground-Up',
    location: 'Draper, UT',
    images: ['/images/projects/Draper_1.png', '/images/projects/Draper_2.png'],
  },
  {
    title: 'Take 5 Oil Change',
    category: 'Ground-Up',
    location: 'Colorado Springs, CO',
    images: ['/images/projects/take5_coSprings.jpg'],
  },
  {
    title: 'Take 5 Oil Change',
    category: 'Conversion',
    location: 'Corpus Christi, TX',
    images: ['/images/projects/corpussy_after.png', '/images/projects/corpussy_before.png'],
  },
  {
    title: 'Ray-Corf Recreation Park',
    category: 'Ground-Up',
    location: 'Burnsville, NC',
    images: ['/images/projects/rayCort_park.jpg'],
  },
];

export default function PortfolioGrid() {
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [photoIndex, setPhotoIndex] = useState(0);

  const openProject = (project: Project) => {
    setActiveProject(project);
    setPhotoIndex(0);
  };

  const closeModal = useCallback(() => {
    setActiveProject(null);
    setPhotoIndex(0);
  }, []);

  const prevPhoto = () =>
    setPhotoIndex((i) => (i - 1 + (activeProject?.images.length ?? 1)) % (activeProject?.images.length ?? 1));

  const nextPhoto = () =>
    setPhotoIndex((i) => (i + 1) % (activeProject?.images.length ?? 1));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!activeProject) return;
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowLeft') prevPhoto();
      if (e.key === 'ArrowRight') nextPhoto();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeProject, closeModal]);

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = activeProject ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [activeProject]);

  return (
    <>
      {/* Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project, index) => (
          <button
            key={index}
            onClick={() => openProject(project)}
            className="group cursor-pointer text-left w-full"
          >
            <div className="aspect-[4/3] bg-jbs-beige relative overflow-hidden mb-4">
              <img
                src={project.images[0]}
                alt={project.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-jbs-dark/0 group-hover:bg-jbs-dark/50 transition-all flex items-center justify-center">
                <span className="text-white font-heading uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-all text-sm flex items-center gap-2">
                  View Project
                  {project.images.length > 1 && (
                    <span className="text-xs bg-jbs-blue/80 px-2 py-0.5">{project.images.length} photos</span>
                  )}
                </span>
              </div>
            </div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-heading text-xl text-jbs-dark uppercase">{project.title}</h3>
                <p className="text-jbs-charcoal/50 text-sm">{project.location}</p>
              </div>
              <span className="text-xs font-heading uppercase tracking-wider text-jbs-blue bg-jbs-blue/10 px-3 py-1 shrink-0">
                {project.category}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox Modal */}
      {activeProject && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex flex-col"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 shrink-0">
            <div>
              <p className="text-jbs-blue font-heading text-xs uppercase tracking-widest">{activeProject.category}</p>
              <h2 className="font-heading text-2xl md:text-3xl text-white uppercase">{activeProject.title}</h2>
              <p className="text-white/50 text-sm">{activeProject.location}</p>
            </div>
            <div className="flex items-center gap-4">
              {activeProject.images.length > 1 && (
                <span className="text-white/40 font-heading text-sm uppercase tracking-wider">
                  {photoIndex + 1} / {activeProject.images.length}
                </span>
              )}
              <button
                onClick={closeModal}
                className="text-white/60 hover:text-white transition-colors font-heading text-sm uppercase tracking-wider"
                aria-label="Close"
              >
                Close ✕
              </button>
            </div>
          </div>

          {/* Image */}
          <div className="flex-1 relative flex items-center justify-center px-4 pb-4 min-h-0">
            <img
              key={photoIndex}
              src={activeProject.images[photoIndex]}
              alt={`${activeProject.title} — photo ${photoIndex + 1}`}
              className="max-h-full max-w-full object-contain"
            />

            {/* Prev / Next arrows */}
            {activeProject.images.length > 1 && (
              <>
                <button
                  onClick={prevPhoto}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-jbs-blue transition-colors flex items-center justify-center text-white"
                  aria-label="Previous photo"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={nextPhoto}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-jbs-blue transition-colors flex items-center justify-center text-white"
                  aria-label="Next photo"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* Thumbnail dots */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                  {activeProject.images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPhotoIndex(i)}
                      className={`w-2 h-2 transition-all ${i === photoIndex ? 'bg-jbs-blue w-6' : 'bg-white/30 hover:bg-white/60'}`}
                      aria-label={`Photo ${i + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
