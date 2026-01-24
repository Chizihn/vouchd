declare module "*.png" {
  const value: any;
  export default value;
}

declare module "*.jpg" {
  const value: any;
  export default value;
}

declare module "*.jpeg" {
  const value: any;
  export default value;
}

declare module "*.svg" {
  import React from 'react';
  import { SvgProps } from 'react-native-svg';
  const content: React.FC<SvgProps>;
  export default content;
}

// Path aliases
declare module "@/*" {
  const value: any;
  export default value;
}

declare module "@components/*" {
  const value: any;
  export default value;
}

declare module "@constants/*" {
  const value: any;
  export default value;
}

declare module "@store/*" {
  const value: any;
  export default value;
}

declare module "@types/*" {
  const value: any;
  export default value;
}

declare module "@utils/*" {
  const value: any;
  export default value;
}

declare module "@graphql/*" {
  const value: any;
  export default value;
}

declare module "@screens/*" {
  const value: any;
  export default value;
}

declare module "@assets/*" {
  const value: any;
  export default value;
}

declare module "@services/*" {
  const value: any;
  export default value;
}

declare module "@hooks/*" {
  const value: any;
  export default value;
}