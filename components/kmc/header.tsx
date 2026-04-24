import Image from 'next/image';

export function KmcHeader() {
  return (
    <header className="grid min-h-22 grid-cols-[128px_1fr_30px] items-center gap-2.5 rounded-xl bg-linear-to-br from-[#0b3f8f] via-[#1e56a0] to-[#3d78c5] px-2.5 py-2 text-white max-[780px]:grid-cols-[92px_1fr_26px]">
      <div className="flex items-center gap-2">
        <Image
          src="/media/Nepal.png"
          alt="Nepal logo"
          width={44}
          height={44}
          className="h-11 w-11 rounded-lg bg-white px-1.5 py-1 object-contain"
        />
        <div className="h-6.5 w-0.5 rounded-sm bg-slate-200/90" />
        <Image
          src="/media/KMC.png"
          alt="KMC logo"
          width={44}
          height={44}
          className="h-11 w-11 rounded-lg bg-white px-1.5 py-1 object-contain"
        />
      </div>

      <div className="text-center leading-tight">
        <h1 className="text-base font-bold max-[780px]:text-sm">काठमाडौं महानगरपालिका</h1>
        <h2 className="mt-0.5 text-xs font-semibold max-[780px]:text-[11px]">Kathmandu Metropolitan City</h2>
        <h2 className="mt-0.5 text-xs font-semibold max-[780px]:text-[11px]">नगर कार्यपालिकाको कार्यालय, बागमती प्रदेश</h2>
        <p className="mt-0.5 text-[11px] opacity-90 max-[780px]:text-[10px]">Digital House Numbering and Address Intelligence Platform</p>
      </div>

      <Image src="/media/Nepal_flag.png" alt="Nepal flag" width={34} height={34} className="justify-self-end object-contain" />
    </header>
  );
}
