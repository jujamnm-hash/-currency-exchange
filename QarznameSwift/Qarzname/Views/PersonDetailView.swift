import SwiftUI
import SwiftData

struct PersonDetailView: View {
    @Environment(\.modelContext) private var context
    @Environment(\.dismiss) private var dismiss
    @Bindable var person: Person
    @State private var payingDebt: Debt?
    @State private var payAmount = ""
    @State private var payNote = ""

    private var sortedDebts: [Debt] {
        person.debts.sorted { $0.createdAt > $1.createdAt }
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                VStack(alignment: .leading, spacing: 6) {
                    Text(person.name).font(.largeTitle.bold())
                    Text(person.phone.isEmpty ? "بێ ژمارەی مۆبایل" : person.phone)
                        .foregroundStyle(.secondary)
                    if !person.notes.isEmpty {
                        Text(person.notes).foregroundStyle(.secondary)
                    }
                }

                LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible()), GridItem(.flexible())], spacing: 10) {
                    StatCard(title: "بۆ من", value: Money.iqd(person.owedToMe), colors: [Color(red: 0.13, green: 0.48, blue: 0.38), Color(red: 0.04, green: 0.14, blue: 0.13)])
                    StatCard(title: "لە من", value: Money.iqd(person.iOwe), colors: [Color(red: 0.77, green: 0.54, blue: 0.29), Color(red: 0.36, green: 0.23, blue: 0.11)])
                    StatCard(title: "باڵانس", value: Money.iqd(person.net), colors: [Color(red: 0.11, green: 0.25, blue: 0.21), Color(red: 0.04, green: 0.14, blue: 0.13)])
                }

                NavigationLink {
                    NewDebtView(preselectedPerson: person)
                } label: {
                    Label("قەرزی نوێ بۆ ئەم کەسە", systemImage: "plus")
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color(red: 0.13, green: 0.48, blue: 0.38))
                        .foregroundStyle(.white)
                        .clipShape(RoundedRectangle(cornerRadius: 14))
                }

                Text("قەرزەکان").font(.title2.bold())

                if sortedDebts.isEmpty {
                    ContentUnavailableView("هیچ قەرزێک نییە", systemImage: "doc")
                        .frame(minHeight: 140)
                } else {
                    ForEach(sortedDebts) { debt in
                        VStack(alignment: .leading, spacing: 10) {
                            HStack {
                                Text(debt.type.shortKU)
                                    .font(.caption.bold())
                                    .padding(.horizontal, 8)
                                    .padding(.vertical, 4)
                                    .background(debt.type == .owedToMe ? Color.green.opacity(0.15) : Color.orange.opacity(0.18))
                                    .clipShape(Capsule())
                                Text(debt.status.titleKU)
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                                Spacer()
                            }
                            Text("\(Money.iqd(debt.remaining)) / \(Money.iqd(debt.amount))")
                                .font(.headline)
                            Text("\(debt.debtDescription.isEmpty ? "بێ وەسف" : debt.debtDescription) · \(Dates.short(debt.date))")
                                .font(.caption)
                                .foregroundStyle(.secondary)

                            if debt.remaining > 0 {
                                Button("پارەدان") {
                                    payingDebt = debt
                                    payAmount = "\(debt.remaining)"
                                    payNote = ""
                                }
                                .buttonStyle(.borderedProminent)
                                .tint(.orange)
                            }

                            if !debt.payments.isEmpty {
                                ForEach(debt.payments.sorted { $0.createdAt > $1.createdAt }) { payment in
                                    Text("پارەدان: \(Money.iqd(payment.amount)) · \(Dates.short(payment.date))" + (payment.note.isEmpty ? "" : " · \(payment.note)"))
                                        .font(.caption)
                                        .foregroundStyle(.secondary)
                                }
                            }
                        }
                        .padding()
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(.white.opacity(0.9))
                        .clipShape(RoundedRectangle(cornerRadius: 14))
                    }
                }
            }
            .padding()
        }
        .navigationTitle("وردەکاری")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .destructiveAction) {
                Button("سڕینەوە", role: .destructive) {
                    context.delete(person)
                    dismiss()
                }
            }
        }
        .sheet(isPresented: Binding(
            get: { payingDebt != nil },
            set: { if !$0 { payingDebt = nil } }
        )) {
            NavigationStack {
                Form {
                    Section("پارەدان") {
                        TextField("بڕ", text: $payAmount)
                            .keyboardType(.numberPad)
                        TextField("تێبینی", text: $payNote)
                    }
                }
                .navigationTitle("پارەدان")
                .toolbar {
                    ToolbarItem(placement: .cancellationAction) {
                        Button("هەڵوەشاندنەوە") { payingDebt = nil }
                    }
                    ToolbarItem(placement: .confirmationAction) {
                        Button("پاشەکەوت") {
                            if let debt = payingDebt {
                                _ = debt.applyPayment(amount: Money.parse(payAmount), note: payNote)
                            }
                            payingDebt = nil
                        }
                    }
                }
            }
            .environment(\.layoutDirection, .rightToLeft)
            .presentationDetents([.medium])
        }
    }
}
