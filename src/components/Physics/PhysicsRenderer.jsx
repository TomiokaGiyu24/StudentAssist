import { useState } from 'react';
import { motion } from 'framer-motion';
import TopicSection from './TopicSection';

function PhysicsRenderer({ topics }) {
    if (!topics || topics.length === 0) {
        return (
            <div className="text-white/40 text-center py-12">
                No physics topics available.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {topics.map((topicData, index) => (
                <TopicSection 
                    key={index} 
                    data={topicData} 
                    index={index} 
                    initiallyExpanded={index === 0} 
                />
            ))}
        </div>
    );
}

export default PhysicsRenderer;
