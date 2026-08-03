import SwiftUI
import SwiftData

struct DebtsView: View {
    @Query(sort: \Debt.createdAt, order: .reverse) private var debts: [Debt]
    @State private var filter: Filter = .all

    enum Filter: String, CaseIterable, Identifiable {
        case all, owedToMe, iOwe, open, partial, paid
        var id: String { rawValue }

        var title: String {
            switch self {
            case .all: return "هەموو"
            case .owedToMe: return "بۆ من"
            case .iOwe: return "لە من"
            case .open: return "کراوە"
            case .partial: return "بەشی پارەدراو"
            case .paid: return "تەواو"
            }
        }
    }

    private var filtered: [Debt] {
        switch filter {
        case .all: return debts
        case .owedToMe: return debts.filter { $0.type == .owedToMe }
        case .iOwe: return debts.filter { $0.type == .iOwe }
        case .open: return debts.filter { $0.status == .open }
        case .partial: return debts.filter { $0.status == .partial }
        case .paid: return debts.filter { $0.status == .paid }
        }
    }

    var body: some View {
        VStack(spacing: 0) {
            ScrollView(.horizontal, showsIndicators: false) {
                HStack {
                    ForEach(Filter.allCases) { item in
                        Button(item.title) { filter = item }
                            .buttonStyle(.bordered)
                            .tint(filter == item ? Color(red: 0.13, green: 0.48, blue: 0.38) : .secondary)
                    }
                }
                .padding()
            }

            List {
                if filtered.isEmpty {
                    ContentUnavailableView("هیچ قەرزێک نییە", systemImage: "tray")
                } else {
                    ForEach(filtered) { debt in
                        if let person = debt.person {
                            NavigationLink {
                                PersonDetailView(person: person)
                            } label: {
                                DebtRow(debt: debt, personName: person.name)
                            }
                            .listRowInsets(EdgeInsets(top: 8, leading: 16, bottom: 8, trailing: 16))
                            .listRowBackground(Color.clear)
                        }
                    }
                }
            }
            .listStyle(.plain)
        }
        .navigationTitle("قەرزەکان")
    }
}
