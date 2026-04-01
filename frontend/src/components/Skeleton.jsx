import React from 'react';

export const SkeletonLine = ({ width = '100%', height = '1rem', borderRadius = '1rem', marginBottom = '0.5rem' }) => (
  <div 
    className="skeleton" 
    style={{ width, height, borderRadius, marginBottom }} 
  />
);

export const SkeletonCircle = ({ size = '3rem', marginBottom = '0' }) => (
  <div 
    className="skeleton" 
    style={{ width: size, height: size, borderRadius: '2.5rem', marginBottom }} 
  />
);

export const SkeletonCard = ({ height = '150px', marginBottom = '1.5rem', borderRadius = '2rem' }) => (
  <div 
    className="glass-panel skeleton" 
    style={{ height, marginBottom, borderRadius, border: 'none' }} 
  />
);

export const DashboardSkeleton = () => (
  <div className="container max-w-5xl py-12 px-6">
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
      <div className="flex items-center gap-4">
        <SkeletonCircle size="64px" />
        <div>
          <SkeletonLine width="200px" height="2rem" />
          <SkeletonLine width="300px" height="1rem" />
        </div>
      </div>
      <div className="flex gap-3">
        <SkeletonCircle size="48px" />
        <SkeletonCircle size="48px" />
      </div>
    </div>

    <div className="grid md:grid-cols-3 gap-6 mb-12">
      <SkeletonCard height="140px" />
      <SkeletonCard height="140px" />
      <SkeletonCard height="140px" />
    </div>

    <div className="glass-panel p-8 rounded-[2.5rem]">
      <div className="flex justify-between mb-8">
        <SkeletonLine width="250px" height="2rem" />
      </div>
      <div className="flex flex-col gap-4">
        {[1, 2, 3, 4].map(i => (
          <SkeletonCard key={i} height="90px" marginBottom="0" borderRadius="1.5rem" />
        ))}
      </div>
    </div>
  </div>
);

export const HistorySkeleton = () => (
  <div className="container max-w-5xl py-12 px-6">
    <div className="flex items-center gap-4 mb-12">
      <div className="w-12 h-12 rounded-2xl overflow-hidden">
        <SkeletonCard height="100%" marginBottom="0" borderRadius="1rem" />
      </div>
      <div>
        <SkeletonLine width="280px" height="2.5rem" />
        <SkeletonLine width="400px" height="1.2rem" />
      </div>
    </div>
    
    <div className="grid md:grid-cols-4 gap-6 mb-12">
      {[1, 2, 3, 4].map(i => (
        <SkeletonCard key={i} height="120px" marginBottom="0" />
      ))}
    </div>

    <SkeletonCard height="350px" marginBottom="4rem" />

    <div className="flex justify-between items-end mb-8">
      <SkeletonLine width="220px" height="2rem" />
      <SkeletonLine width="100px" height="1rem" />
    </div>
    
    <div className="grid gap-4">
      {[1, 2, 3, 4, 5].map(i => (
        <SkeletonCard key={i} height="100px" marginBottom="0" borderRadius="1.5rem" />
      ))}
    </div>
  </div>
);

export const SummarySkeleton = () => (
  <div className="container max-w-4xl py-12 px-6">
    <div className="flex flex-col gap-10">
      <SkeletonCard height="450px" borderRadius="3rem" />
      <div className="grid md:grid-cols-2 gap-8">
        <SkeletonCard height="220px" borderRadius="2.5rem" marginBottom="0" />
        <SkeletonCard height="220px" borderRadius="2.5rem" marginBottom="0" />
      </div>
      <SkeletonCard height="500px" borderRadius="2.5rem" />
    </div>
  </div>
);

