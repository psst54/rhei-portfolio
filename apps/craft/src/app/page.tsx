import { Footer } from "@rhei/ui";
import Link from "next/link";

interface Card {
  title: string;
  description: string;
  thumbnail: string;
  link: string;
}

const ITEM_LIST = [
  {
    title: "Fake 3D 알약",
    description:
      "원과 사각형 요소만으로 입체적으로 회전하는 알약 애니메이션을 만듭니다.",
    link: "/fake3dPill",
    thumbnail:
      "https://tnzycdohhtvupgagmwfx.supabase.co/storage/v1/object/public/rhei-craft//fake3dPill.webp",
  },
  {
    title: "Throttle 예시",
    description:
      "정해진 시간 간격마다 이벤트를 실행하여 호출 빈도를 제어합니다.",
    link: "/throttle",
    thumbnail:
      "https://tnzycdohhtvupgagmwfx.supabase.co/storage/v1/object/public/rhei-craft//throttle.webp",
  },
  {
    title: "Debounce 예시",
    description:
      "사용자 입력이 멈췄을 때만 이벤트를 실행하여 과도한 호출을 방지합니다.",
    link: "/debounce",
    thumbnail:
      "https://tnzycdohhtvupgagmwfx.supabase.co/storage/v1/object/public/rhei-craft//debounce.webp",
  },
  {
    title: "Wavy Text",
    description: "텍스트가 물결처럼 흔들리는 애니메이션을 구현합니다.",
    link: "/wavy-text",
    thumbnail:
      "https://tnzycdohhtvupgagmwfx.supabase.co/storage/v1/object/public/rhei-craft//wavy-text.webp",
  },
  {
    title: "Draggable Panel",
    description:
      "드래그 가능한 패널을 만들어 트리 구조를 변경하고 렌더링합니다.",
    link: "/draggable-panel",
    thumbnail:
      "https://tnzycdohhtvupgagmwfx.supabase.co/storage/v1/object/public/rhei-craft//draggable-panel.webp",
  },
];

function CardItem({ data }: { data: Card }) {
  const { title, description, thumbnail, link } = data;

  return (
    <Link
      key={title}
      href={link}
      className="rounded-3xl bg-[#eaeaea] p-2 hover:text-blue-500 dark:bg-[#303030] dark:hover:text-orange-500"
    >
      <article className="flex flex-col">
        <img
          src={thumbnail}
          alt={title}
          className="mb-2 aspect-[16/9] rounded-2xl object-cover"
        />
        <div className="p-2">
          <h3 className="text-[1.4rem] font-bold">{title}</h3>
          <p className="text-gray-400 dark:text-gray-300">{description}</p>
        </div>
      </article>
    </Link>
  );
}

export default async function Home() {
  return (
    <>
      <main className="content-x">
        <section className="mx-auto w-full max-w-6xl">
          <div className="mt-8 grid grid-cols-[1fr] gap-x-6 gap-y-12 sm:grid-cols-[1fr_1fr] sm:gap-y-8 lg:grid-cols-[1fr_1fr_1fr]">
            {ITEM_LIST.toReversed().map((item) => (
              <CardItem key={item.title} data={item} />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export const runtime = "edge";
