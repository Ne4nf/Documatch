import Image from 'next/image';

function SmallLogo() {
  return (
    <Image alt="logo" height={48} priority src="/netsmileDrawerLogo.png" width={48} />
  );
}

export default SmallLogo;
