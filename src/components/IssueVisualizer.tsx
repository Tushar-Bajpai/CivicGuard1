import React from "react";

interface IssueVisualizerProps {
  type: string;
  animate?: boolean;
}

const CATEGORY_IMAGES: Record<string, string> = {
  pothole: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=600",
  road_damage: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=600",
  water_leak: "https://images.unsplash.com/photo-1542013936693-8848e574047e?auto=format&fit=crop&q=80&w=600",
  streetlight: "https://images.unsplash.com/photo-1509024644558-2f56ce76c090?auto=format&fit=crop&q=80&w=600",
  electrical_hazard: "https://images.unsplash.com/photo-1509024644558-2f56ce76c090?auto=format&fit=crop&q=80&w=600",
  garbage: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&q=80&w=600",
  hazardous_waste: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&q=80&w=600",
  fallen_tree: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&q=80&w=600",
  canopy_decay: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&q=80&w=600",
  other: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=600",
  pothole_or_road_damage: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=600",
  water_leak_or_flooding: "https://images.unsplash.com/photo-1542013936693-8848e574047e?auto=format&fit=crop&q=80&w=600",
  streetlight_broken: "https://images.unsplash.com/photo-1509024644558-2f56ce76c090?auto=format&fit=crop&q=80&w=600",
  waste_or_garbage_dump: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&q=80&w=600",
  fallen_tree_or_debris: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&q=80&w=600"
};

export default function IssueVisualizer({ type, animate = true }: IssueVisualizerProps) {
  // Check if type is a direct URL or base64 string
  const isDirectUrl = type && (
    type.startsWith("data:") || 
    type.startsWith("blob:") || 
    type.startsWith("http:") || 
    type.startsWith("https:")
  );

  const imageUrl = isDirectUrl 
    ? type 
    : (CATEGORY_IMAGES[type] || CATEGORY_IMAGES["other"]);

  return (
    <div className="w-full h-full relative bg-[#0A0D04]/90 rounded-lg overflow-hidden border border-[#FAFFF3]/10 flex items-center justify-center">
      <img 
        src={imageUrl} 
        alt="Incident evidence photo" 
        className="w-full h-full object-cover"
        referrerPolicy="no-referrer"
      />
    </div>
  );
}
