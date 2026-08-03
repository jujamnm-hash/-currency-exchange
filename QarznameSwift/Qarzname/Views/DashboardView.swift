import SwiftUI
import SwiftData

struct DashboardView: View {
    @Query(sort: \Debt.createdAt, order: .reverse) private var debts: [Debt]
    @Query(sort: \Person.name) private var people: [Person]

    private var owedToMe: Int {
        debts.filter { $0.type == .owedToMe && $0.remaining > 0 }.reduce(0) { $0 + $1.remaining }
    }

    private var iOwe: Int {
        debts.filter { $0.type == .iOwe && $0.remaining > 0 }.reduce(0) { $0 + $1.remaining }
    }

    private var openCount: Int {
        debts.filter { $0.remaining > 0 }.count
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                VStack(alignment: .leading, spacing: 8) {
                    Text("قەرزنامە")
                        .font(.largeTitle.bold())
                    Text("تۆماری قەرزەکانت لە یەک شوێن — داتا لەسەر ئایپادەکەت دەمێنێتەوە.")
                        .foregroundStyle(.secondary)
                }
                .padding(.horizontal)

                LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                    StatCard(title: "قەرزی کەسان لای من", value: Money.iqd(owedToMe), colors: [Color(red: 0.13, green: 0.48, blue: 0.38), Color(red: 0.04, green: 0.14, blue: 0.13)])
                    StatCard(title: "قەرزی من لای کەسان", value: Money.iqd(iOwe), colors: [Color(red: 0.77, green: 0.54, blue: 0.29), Color(red: 0.36, green: 0.23, blue: 0.11)])
                    StatCard(title: "باڵانسی گشتی", value: Money.iqd(owedToMe - iOwe), colors: [Color(red: 0.11, green: 0.25, blue: 0.21), Color(red: 0.04, green: 0.14, blue: 0.13)])
                }
                .padding(.horizontal)

                HStack {
                    Text("\(openCount) قەرزی کراوە · \(people.count) کەس")
                        .foregroundStyle(.secondary)
                    Spacer()
                }
                .padding(.horizontal)

                NavigationLink {
                    NewDebtView()
                } label: {
                    Label("قەرزی نوێ تۆمار بکە", systemImage: "plus")
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color(red: 0.13, green: 0.48, blue: 0.38))
                        .foregroundStyle(.white)
                        .clipShape(RoundedRectangle(cornerRadius: 14))
                }
                .padding(.horizontal)

                VStack(alignment: .leading, spacing: 12) {
                    Text("دوایین قەرزەکان")
                        .font(.title2.bold())
                        .padding(.horizontal)

                    if debts.isEmpty {
                        ContentUnavailableView("هیچ قەرزێک نییە", systemImage: "tray", description: Text("یەکەم قەرز تۆمار بکە"))
                            .frame(minHeight: 180)
                    } else {
                        ForEach(debts.prefix(8)) { debt in
                            if let person = debt.person {
                                NavigationLink {
                                    PersonDetailView(person: person)
                                } label: {
                                    DebtRow(debt: debt, personName: person.name)
                                }
                                .padding(.horizontal)
                            }
                        }
                    }
                }
            }
            .padding(.vertical)
        }
        .background(
            LinearGradient(
                colors: [Color(red: 0.93, green: 0.96, blue: 0.94), Color(red: 0.96, green: 0.98, blue: 0.97)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()
        )
        .navigationTitle("سەرەکی")
        .navigationBarTitleDisplayMode(.inline)
    }
}

struct StatCard: View {
    let title: String
    let value: String
    let colors: [Color]

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text(title)
                .font(.subheadline)
                .foregroundStyle(.white.opacity(0.9))
            Text(value)
                .font(.title2.bold())
                .foregroundStyle(.white)
                .minimumScaleFactor(0.7)
                .lineLimit(1)
        }
        .frame(maxWidth: .infinity, minHeight: 110, alignment: .leading)
        .padding()
        .background(
            LinearGradient(colors: colors, startPoint: .topLeading, endPoint: .bottomTrailing)
        )
        .clipShape(RoundedRectangle(cornerRadius: 18))
    }
}

struct DebtRow: View {
    let debt: Debt
    let personName: String

    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text(personName).font(.headline)
                Text("\(debt.debtDescription.isEmpty ? "بێ وەسف" : debt.debtDescription) · \(Dates.short(debt.date))")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            Spacer()
            VStack(alignment: .trailing, spacing: 4) {
                Text(Money.iqd(debt.remaining)).font(.headline)
                Text(debt.type.shortKU)
                    .font(.caption2.bold())
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(debt.type == .owedToMe ? Color.green.opacity(0.15) : Color.orange.opacity(0.18))
                    .foregroundStyle(debt.type == .owedToMe ? Color.green.opacity(0.9) : Color.orange)
                    .clipShape(Capsule())
            }
        }
        .padding()
        .background(.white.opacity(0.85))
        .clipShape(RoundedRectangle(cornerRadius: 14))
    }
}
