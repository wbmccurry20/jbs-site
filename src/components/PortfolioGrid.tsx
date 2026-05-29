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
    title: 'Mister Car Wash',
    category: 'Ground-Up',
    location: 'Tucson, AZ',
    images: [
      '/images/projects/mister_car_wash_Tucson_AZ1.jpg',
      '/images/projects/mister_car_wash_Tucson_AZ2.jpg',
      '/images/projects/mister_car_wash_Tucson_AZ3.jpg',
    ],
  },
  {
    title: 'Mister Car Wash',
    category: 'Brand Refresh',
    location: 'Atlanta, GA',
    images: [
      '/images/projects/mister_car_wash_after_ATL.GA.jpg.jpg',
      '/images/projects/mister_car_wash_before_ATL.GA.jpg',
    ],
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
    images: [
      '/images/projects/corpus_christi_after.png',
      '/images/projects/corpus_christi_before.png',
    ],
  },
  {
    title: 'Take 5 Oil Change',
    category: 'Ground-Up',
    location: 'Suffolk, VA',
    images: [
      '/images/projects/take5_groudup_ Suffolk_VA1.jpg',
      '/images/projects/take5_groudup_ Suffolk_VA2.jpg',
      '/images/projects/take5_groudup_ Suffolk_VA3.jpg',
      '/images/projects/take5_groudup_ Suffolk_VA4.jpg',
    ],
  },
  {
    title: 'Take 5 Oil Change',
    category: 'Ground-Up',
    location: 'Jacksonville, FL',
    images: [
      '/images/projects/take_5_groundup_Jacksonville_FL1.jpg',
      '/images/projects/take_5_groundup_Jacksonville_FL2.jpg',
      '/images/projects/take_5_groundup_Jacksonville_FL3.jpg',
      '/images/projects/take_5_groundup_Jacksonville_FL4.jpg',
    ],
  },
  {
    title: 'Take 5 Oil Change',
    category: 'Ground-Up',
    location: 'Apollo Beach, FL',
    images: [
      '/images/projects/take_5_oil_change_apollo_beach_FL1.jpg',
      '/images/projects/take_5_oil_change_apollo_beach_FL2.jpg',
      '/images/projects/take_5_oil_change_apollo_beach_FL3.jpg',
      '/images/projects/take_5_oil_change_apollo_beach_FL4.jpg',
    ],
  },
  {
    title: 'Tidal Wave Auto Spa',
    category: 'Ground-Up',
    location: 'Early, TX',
    images: [
      '/images/projects/tidal_wave_auto_spa_Early_TX1.jpg',
      '/images/projects/tidal_wave_auto_spa_Early_TX2.jpg',
      '/images/projects/tidal_wave_auto_spa_Early_TX3.jpg',
    ],
  },
  {
    title: 'Ionna Charging Hub',
    category: 'Ground-Up',
    location: 'Apex, NC',
    images: [
      '/images/projects/ionna_charging_hub_Apex_NC1.jpg',
      '/images/projects/ionna_charging_hub_Apex_NC12.jpg',
      '/images/projects/ionna_charging_hub_Apex_NC13.jpg',
    ],
  },
  {
    title: 'Ray-Cort Recreation Park',
    category: 'Ground-Up',
    location: 'Burnsville, NC',
    images: [
      '/images/projects/rayCort_park.jpg',
      '/images/projects/ray_cort_Burnsville_NC1.png',
      '/images/projects/ray_cort_Burnsville_NC2.jpg',
    ],
  },
  {
    title: 'Take 5 Oil Change',
    category: 'Ground-Up',
    location: 'Surprise, AZ',
    images: [
      '/images/projects/Surprise_AZ1.jpg',
      '/images/projects/Surprise_AZ2.jpg',
      '/images/projects/Surprise_AZ3.jpg',
      '/images/projects/Surprise_AZ4.jpg',
      '/images/projects/Surprise_AZ5.jpg',
    ],
  },
  {
    title: 'AutoZone',
    category: 'Ground-Up',
    location: 'Orange City, FL',
    images: [
      '/images/projects/AutoZone_OrangeCity_FL1.png',
      '/images/projects/AutoZone_OrangeCity_FL2.png',
    ],
  },
  {
    title: 'Valvoline',
    category: 'Ground-Up',
    location: 'Glasgow, KY',
    images: [
      '/images/projects/Vavoline_Glasgow_KY1.jpg',
      '/images/projects/Vavoline_Glasgow_KY2.jpg',
    ],
  },
];

const CATEGORIES = ['All', 'Ground-Up', 'Conversion', 'Brand Refresh'];

export default function PortfolioGrid() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [photoIndex, setPhotoIndex] = useState(0);

  const filtered = activeFilter === 'All' ? projects : projects.filter((p) => p.category === activeFilter);

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
      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-3 justify-center mb-12">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            className={`px-6 py-2 font-heading text-sm uppercase tracking-wider transition-all ${
              activeFilter === cat
                ? 'bg-jbs-dark text-white'
                : 'bg-jbs-beige text-jbs-charcoal hover:bg-jbs-dark hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((project, index) => (
          <button
            key={`${project.title}-${project.location}`}
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
