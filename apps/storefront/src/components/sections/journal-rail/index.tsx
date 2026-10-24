import Image from "next/image"
import Link from "next/link"
import { SectionEyebrow, SectionShell, TextCta } from "@/components/sections/_editorial"
import { listPosts, journalCoverSrc, formatPostDate } from "@/lib/blog"
import { localizeImageUrl } from "@/lib/images"

export async function JournalRailSection() {
  let posts: Awaited<ReturnType<typeof listPosts>>["posts"] = []
  try {
    const result = await listPosts({ limit: 4 })
    posts = result.posts
  } catch {
    posts = []
  }

  return (
    <SectionShell id="journal" aria-labelledby="journal-heading">
      <div className="flex flex-col gap-[1em] sm:flex-row sm:items-end sm:justify-between">
        <div>
          <SectionEyebrow>journal</SectionEyebrow>
          <h2
            id="journal-heading"
            className="mt-[0.75em] m-0 font-outfit text-[clamp(1.75em,4vw,3em)] leading-[1.15] font-normal tracking-[-0.03em] text-balance"
          >
            Notes from the bench.
          </h2>
        </div>
        <TextCta href="/blog">Read the journal</TextCta>
      </div>

      {posts.length === 0 ? (
        <p className="mt-[2em] m-0 font-outfit text-pretty text-[#6B635C]">
          New workshop notes arrive soon.
        </p>
      ) : (
        <ul className="mt-[clamp(1.75em,3.5vw,3em)] m-0 flex list-none snap-x snap-mandatory gap-[1em] overflow-x-auto p-0 pb-2 lg:grid lg:grid-cols-4 lg:gap-[1.25em] lg:overflow-visible lg:pb-0">
          {posts.map((post) => {
            const cover = localizeImageUrl(journalCoverSrc(post))
            return (
              <li key={post.id} className="min-w-[75%] snap-start sm:min-w-[42%] lg:min-w-0">
                <Link href={`/blog/${post.slug}`} className="group block no-underline">
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#D9D9D9]">
                    {cover ? (
                      <Image
                        src={cover}
                        alt={post.title}
                        fill
                        sizes="(min-width: 90rem) 20rem, 75vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      />
                    ) : null}
                  </div>
                  <p className="mt-[0.75em] m-0 font-outfit text-[0.75em] uppercase tracking-[0.1em] text-[#6B635C]">
                    {formatPostDate(post.published_at)}
                  </p>
                  <h3 className="mt-[0.4em] m-0 font-outfit text-[1.125em] leading-[1.3] font-normal tracking-[-0.02em] text-balance text-[#131111]">
                    {post.title}
                  </h3>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </SectionShell>
  )
}
