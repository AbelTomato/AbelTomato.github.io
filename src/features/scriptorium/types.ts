export interface ScriptoriumSite {
  name: string;
  description: string;
  url: string;
  icon: string;
}

export interface ScriptoriumCollection {
  category: string;
  description: string;
  items: ScriptoriumSite[];
}