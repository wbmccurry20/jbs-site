import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const projects = [
  {
    id: 1,
    title: 'Modern Mountain Retreat',
    location: 'Asheville, NC',
    type: 'New Construction',
    sqft: '3,200 sq ft',
    year: '2025',
    image: 'https://placehold.co/800x600/004E89/ffffff?text=Mountain+Home',
    description: 'Contemporary design with sustainable materials and panoramic mountain views.',
    features: ['Solar panels', 'Rainwater collection', 'Passive heating'],
  },
  {
    id: 2,
    title: 'Historic Home Revival',
    location: 'Boone, NC',
    type: 'Renovation',
    sqft: '2,800 sq ft',
    year: '2024',
    image: 'https://placehold.co/800x600/F7C548/1A1A2E?text=Historic+Revival',
    description: 'Restored 1920s craftsman with modern amenities while preserving original character.',
    features: ['Original hardwood restored', 'Modern kitchen', 'Energy efficient'],
  },
  {
    id: 3,
    title: 'Family Addition',
    location: 'Blowing Rock, NC',
    type: 'Addition',
    sqft: '1,500 sq ft',
    year: '2024',
    image: 'https://placehold.co/800x600/FF6B35/ffffff?text=Family+Addition',
    description: 'Seamless second-story addition matching existing architecture.',
    features: ['Two bedrooms', 'Master bath', 'Home office'],
  },
];

export default function ProjectShowcase() {
  const [selectedProject, setSelectedProject] = useState(projects[0]);

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Project List */}
      <div className="space-y-4">
        {projects.map((project) => (
          <motion.button
            key={project.id}
            onClick={() => setSelectedProject(project)}
            className={`w-full text-left p-6 rounded-xl transition-all ${
              selectedProject.id === project.id
                ? 'bg-gradient-to-r from-construction-primary to-construction-accent text-white shadow-xl scale-105'
                : 'bg-white hover:shadow-lg hover:scale-102'
            }`}
            whileHover={{ scale: selectedProject.id !== project.id ? 1.02 : 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-display font-bold">
                {project.title}
              </h3>
              <span
                className={`text-xs px-3 py-1 rounded-full ${
                  selectedProject.id === project.id
                    ? 'bg-white/20'
                    : 'bg-construction-primary/10 text-construction-primary'
                }`}
              >
                {project.type}
              </span>
            </div>
            <p
              className={`text-sm ${
                selectedProject.id === project.id
                  ? 'text-white/90'
                  : 'text-construction-steel'
              }`}
            >
              {project.location} • {project.sqft} • {project.year}
            </p>
          </motion.button>
        ))}
      </div>

      {/* Project Details */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedProject.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl shadow-2xl overflow-hidden"
        >
          <div className="relative h-80">
            <img
              src={selectedProject.image}
              alt={selectedProject.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <h3 className="text-3xl font-display font-bold mb-2">
                {selectedProject.title}
              </h3>
              <p className="text-sm opacity-90">{selectedProject.location}</p>
            </div>
          </div>

          <div className="p-8">
            <p className="text-construction-dark mb-6">
              {selectedProject.description}
            </p>

            <div className="space-y-3">
              <h4 className="font-semibold text-construction-dark">
                Key Features:
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedProject.features.map((feature, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-construction-primary/10 text-construction-primary rounded-full text-sm font-medium"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between items-center">
              <div>
                <div className="text-sm text-construction-steel">Project Size</div>
                <div className="text-lg font-semibold text-construction-dark">
                  {selectedProject.sqft}
                </div>
              </div>
              <div>
                <div className="text-sm text-construction-steel">Completed</div>
                <div className="text-lg font-semibold text-construction-dark">
                  {selectedProject.year}
                </div>
              </div>
              <a
                href="/portfolio"
                className="px-6 py-2 bg-construction-primary text-white rounded-lg font-semibold hover:bg-construction-primary/90 transition-colors"
              >
                View All
              </a>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
