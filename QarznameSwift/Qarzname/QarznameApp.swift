import SwiftUI
import SwiftData

@main
struct QarznameApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(\.layoutDirection, .rightToLeft)
                .environment(\.locale, Locale(identifier: "ku"))
        }
        .modelContainer(for: [Person.self, Debt.self, Payment.self])
    }
}
