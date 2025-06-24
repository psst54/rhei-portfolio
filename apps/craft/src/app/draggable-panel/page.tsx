import { Footer } from "@rhei/ui";
import Screen from "./_components/Screen";

export default function Page() {
  return (
    <>
      <main className="content-x">
        <h1 className="mx-auto w-full max-w-6xl text-[2rem] font-bold">
          Draggable Panel
        </h1>
        
        <p className="mx-auto mt-2 w-full max-w-6xl text-gray-600">
          패널을 드래그하여 tree 구조를 변경하고 새로 렌더링해보세요. 
          패널을 다른 패널 위에 드래그하면 분할됩니다.
        </p>

        <section className="mx-auto mt-4 flex w-full max-w-6xl flex-col gap-8">
          <Screen />
        </section>
      </main>

      <Footer />
    </>
  );
}
