import { describe, expect, test } from "vitest"

import { readSearch, searchKey, toApiQuery, writeSearch } from "./search"

const read = (query: string) => readSearch(new URLSearchParams(query))

describe("readSearch", () => {
  test("round-trips through the URL", () => {
    const query =
      "q=react&location=Pune&type=full_time&type=remote&industry=IT+%2F+Software&exp=3&pay=6&hide=applied&sort=salary&page=2"
    expect(writeSearch(read(query)).toString()).toBe(query)
  })

  test("drops values the API would reject with a 400", () => {
    const search = read("type=freelance&type=contract&sort=random&page=-1")
    expect(search.types).toEqual(["contract"])
    expect(search.sort).toBe("newest")
    expect(search.page).toBe(1)
  })

  test("reads old free-text experience and salary as their first number", () => {
    const search = read("experience=2-5&salary=6-10 LPA")
    expect(search.experience).toBe(2)
    expect(search.pay).toBe(6)
  })

  test("caps experience at the slider's end and ignores junk", () => {
    expect(read("exp=45").experience).toBe(30)
    expect(read("exp=abc&pay=-4").experience).toBeNull()
    expect(read("pay=-4").pay).toBeNull()
  })

  test("keeps a fresher's zero years", () => {
    expect(read("exp=0").experience).toBe(0)
  })
})

describe("searchKey", () => {
  test("ignores page and sort so a saved search matches on any page", () => {
    expect(searchKey(read("q=go&sort=salary&page=3"))).toBe(
      searchKey(read("q=go"))
    )
  })
})

describe("toApiQuery", () => {
  test("asks for jobs whose range includes the candidate's years", () => {
    const query = toApiQuery(read("exp=4&pay=10"))
    expect(query.experience_min).toBe(4)
    expect(query.experience_max).toBe(4)
    expect(query.salary_min).toBe(10)
  })

  test("joins multi-select filters with commas for OR", () => {
    const query = toApiQuery(
      read("type=full_time&type=part_time&industry=Finance&industry=Retail")
    )
    expect(query.employment_type).toBe("full_time,part_time")
    expect(query.industry_type).toBe("Finance,Retail")
  })

  test("maps sort and the applied toggle", () => {
    expect(toApiQuery(read("sort=experience&hide=applied"))).toMatchObject({
      sort_by: "experience",
      order: "asc",
      job_type: "not_applied",
    })
    expect(toApiQuery(read(""))).toMatchObject({
      sort_by: "created_at",
      order: "desc",
      job_type: undefined,
      employment_type: undefined,
    })
  })
})
