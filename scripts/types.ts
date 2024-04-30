export type Builder = {
  id: string;
  socialLinks?: SocialLinks;
  role: Role;
  function?: BuilderFunction;
  creationTimestamp: number;
  builds?: Build[];
  ens?: string;
  status?: Status;
  reachedOut?: boolean;
  scholarship?: boolean;
  builderBatch?: null | string;
  stream?: Stream;
  builderCohort?: BuilderCohortElement[] | PurpleBuilderCohort;
  graduated?: Graduated;
  ensClaimData?: EnsClaimData;
  disabled?: boolean;
};

export type BuilderCohortElement = {
  name: string;
  id: string;
  url: string;
};

export type PurpleBuilderCohort = {
  name: string;
  link: string;
};

export type Build = {
  submittedTimestamp: number;
  id: string;
};

export type EnsClaimData = {
  submittedTimestamp: number;
  provided: boolean;
};

export enum BuilderFunction {
  Advisor = "advisor",
  Artist = "artist",
  Cadets = "cadets",
  DamageDealer = "damageDealer",
  Frontend = "frontend",
  Fullstack = "fullstack",
  Infantry = "infantry",
  Support = "support",
}

export type Graduated = {
  reason: string;
  status: boolean;
};

export enum Role {
  Admin = "admin",
  Builder = "builder",
}

export type SocialLinks = {
  twitter?: string;
  github?: string;
  telegram?: string;
  discord?: string;
  email?: string;
  instagram?: string;
};

export type Status = {
  text: string;
  timestamp: number;
};

export type Stream = {
  lastContract?: number;
  cap?: string;
  balance?: string;
  lastIndexedBlock?: number;
  streamAddress: string;
  frequency?: number;
};
