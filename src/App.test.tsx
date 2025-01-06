import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { MemoryRouter } from "react-router-dom"
import { ErrorComponent } from "./components/error-404-component"

function wrapper({ children }: any) {
  return <MemoryRouter initialEntries={["/"]}>{children}</MemoryRouter>
}

describe("Not Found Page", () => {
  it("should render the Not Found page when the route does not match", () => {
    // Render the ErrorComponent within the MemoryRouter wrapper
    render(<ErrorComponent />, { wrapper })

    // Assert that the expected content is rendered
    const text = screen.getByRole("paragraph")
    expect(text).toHaveTextContent(/Page Not Found/i)
  })
})
