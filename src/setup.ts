/* eslint-disable import/no-extraneous-dependencies */
import "@testing-library/jest-dom/vitest"
import "msw"
import { server } from "./mock/server"

beforeAll(() => {
  server.listen()
})

afterEach(() => {
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})
