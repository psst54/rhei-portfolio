import { Footer } from "@rhei/ui";
import Screen from "./_components/Screen";

export default function Page() {
  return (
    <>
      <main className="content-x">
        <h1 className="mx-auto w-full max-w-6xl text-[2rem] font-bold">
          Draggable Panel
        </h1>

        <ul className="mx-auto mt-2 flex w-full max-w-6xl flex-col gap-2 text-gray-600">
          <li>
            패널을 다른 패널 위로 옮겨 화면 구조를 변경할 수 있습니다. 패널을
            잡고 다른 패널 위로 드래그하면 해당 패널이 반으로 분할됩니다.
          </li>
          <li>
            (PC) 패널과 패널 사이에 두 패널의 크기 비율을 조절할 수 있는 바가
            있습니다. 바를 이동시켜서 패널 분할 비율을 변경해보세요.
          </li>
        </ul>

        <section className="mx-auto mt-4 flex w-full max-w-6xl flex-col gap-8">
          <Screen />
        </section>
      </main>

      <Footer />
    </>
  );
}
