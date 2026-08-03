import SwiftUI
import SwiftData

struct ContentView: View {
    @Environment(\.horizontalSizeClass) private var sizeClass

    var body: some View {
        Group {
            if sizeClass == .regular {
                NavigationSplitView {
                    SidebarView()
                } detail: {
                    NavigationStack {
                        DashboardView()
                    }
                }
            } else {
                TabView {
                    NavigationStack { DashboardView() }
                        .tabItem { Label("سەرەکی", systemImage: "house.fill") }
                    NavigationStack { PeopleView() }
                        .tabItem { Label("کەسەکان", systemImage: "person.2.fill") }
                    NavigationStack { NewDebtView() }
                        .tabItem { Label("قەرزی نوێ", systemImage: "plus.circle.fill") }
                    NavigationStack { DebtsView() }
                        .tabItem { Label("قەرزەکان", systemImage: "list.bullet.rectangle") }
                    NavigationStack { SettingsView() }
                        .tabItem { Label("ڕێکخستن", systemImage: "gearshape.fill") }
                }
            }
        }
        .tint(Color(red: 0.13, green: 0.48, blue: 0.38))
    }
}

struct SidebarView: View {
    var body: some View {
        List {
            Section("قەرزنامە") {
                NavigationLink {
                    DashboardView()
                } label: {
                    Label("سەرەکی", systemImage: "house.fill")
                }
                NavigationLink {
                    PeopleView()
                } label: {
                    Label("کەسەکان", systemImage: "person.2.fill")
                }
                NavigationLink {
                    NewDebtView()
                } label: {
                    Label("قەرزی نوێ", systemImage: "plus.circle.fill")
                }
                NavigationLink {
                    DebtsView()
                } label: {
                    Label("قەرزەکان", systemImage: "list.bullet.rectangle")
                }
                NavigationLink {
                    SettingsView()
                } label: {
                    Label("ڕێکخستن", systemImage: "gearshape.fill")
                }
            }
        }
        .navigationTitle("قەرزنامە")
    }
}

#Preview {
    ContentView()
        .modelContainer(for: [Person.self, Debt.self, Payment.self], inMemory: true)
        .environment(\.layoutDirection, .rightToLeft)
}
