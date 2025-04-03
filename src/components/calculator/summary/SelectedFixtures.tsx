
import React from 'react';
import { Fixture } from '@/lib/supabase';

interface SelectedFixturesProps {
  fixtures: {
    electrical: Fixture[];
    plumbing: Fixture[];
    additional: Fixture[];
  };
  selectedFixtures: {
    electrical: {
      ledMirror: boolean;
      exhaustFan: boolean;
      waterHeater: boolean;
    };
    plumbing: {
      completePlumbing: boolean;
      fixtureInstallationOnly: boolean;
    };
    additional: {
      showerPartition: boolean;
      vanity: boolean;
      bathtub: boolean;
      jacuzzi: boolean;
    };
  };
}

const SelectedFixtures: React.FC<SelectedFixturesProps> = ({ fixtures, selectedFixtures }) => {
  // Helper to find fixture name from fixture key
  const getFixtureName = (category: 'electrical' | 'plumbing' | 'additional', fixtureKey: string): string => {
    const fixtureList = fixtures[category];
    if (!fixtureList.length) return formatFixtureKey(fixtureKey);
    
    const fixture = fixtureList.find(f => 
      f.name.toLowerCase().includes(fixtureKey.toLowerCase())
    );
    
    return fixture ? fixture.name : formatFixtureKey(fixtureKey);
  };
  
  // Format fixture key as fallback
  const formatFixtureKey = (key: string): string => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase());
  };

  // Helper to determine which fixtures were selected
  const getSelectedFixtures = () => {
    const selected = [];
    
    // Electrical fixtures
    if (selectedFixtures.electrical.ledMirror) 
      selected.push(getFixtureName('electrical', 'ledMirror'));
    if (selectedFixtures.electrical.exhaustFan) 
      selected.push(getFixtureName('electrical', 'exhaustFan'));
    if (selectedFixtures.electrical.waterHeater) 
      selected.push(getFixtureName('electrical', 'waterHeater'));
    
    // Plumbing fixtures
    if (selectedFixtures.plumbing.completePlumbing) 
      selected.push(getFixtureName('plumbing', 'completePlumbing'));
    if (selectedFixtures.plumbing.fixtureInstallationOnly) 
      selected.push(getFixtureName('plumbing', 'fixtureInstallationOnly'));
    
    // Additional fixtures
    if (selectedFixtures.additional.showerPartition) 
      selected.push(getFixtureName('additional', 'showerPartition'));
    if (selectedFixtures.additional.vanity) 
      selected.push(getFixtureName('additional', 'vanity'));
    if (selectedFixtures.additional.bathtub) 
      selected.push(getFixtureName('additional', 'bathtub'));
    if (selectedFixtures.additional.jacuzzi) 
      selected.push(getFixtureName('additional', 'jacuzzi'));
    
    // Always add other execution charges
    const otherExecutionCharges = fixtures.additional.find(
      f => f.name.toLowerCase().includes('other execution charges')
    );
    if (otherExecutionCharges) {
      selected.push(otherExecutionCharges.name);
    }
    
    return selected;
  };

  return (
    <div className="md:col-span-2">
      <h5 className="text-sm font-medium text-muted-foreground mb-2">Selected Fixtures</h5>
      <div className="flex flex-wrap gap-2">
        {getSelectedFixtures().map((fixture, index) => (
          <span 
            key={index} 
            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground"
          >
            {fixture}
          </span>
        ))}
      </div>
    </div>
  );
};

export default SelectedFixtures;
