import SwiftUI
import SwiftData

struct NewDebtView: View {
    @Environment(\.modelContext) private var context
    @Environment(\.dismiss) private var dismiss
    @Query(sort: \Person.name) private var people: [Person]

    var preselectedPerson: Person? = nil

    @State private var modeNewPerson = false
    @State private var selectedPersonID: UUID?
    @State private var newName = ""
    @State private var type: DebtType = .owedToMe
    @State private var amountText = ""
    @State private var descriptionText = ""
    @State private var date = Date()
    @State private var saved = false

    var body: some View {
        Form {
            Section("جۆری قەرز") {
                Picker("جۆر", selection: $type) {
                    ForEach(DebtType.allCases, id: \.self) { t in
                        Text(t.titleKU).tag(t)
                    }
                }
                .pickerStyle(.segmented)
            }

            Section("کەس") {
                if preselectedPerson == nil {
                    Picker("شێواز", selection: $modeNewPerson) {
                        Text("کەسی هەبوو").tag(false)
                        Text("کەسی نوێ").tag(true)
                    }
                    .pickerStyle(.segmented)
                }

                if let preselectedPerson {
                    Text(preselectedPerson.name)
                } else if modeNewPerson {
                    TextField("ناوی کەس", text: $newName)
                } else {
                    Picker("کەس", selection: $selectedPersonID) {
                        Text("هەڵبژێرە...").tag(Optional<UUID>.none)
                        ForEach(people) { person in
                            Text(person.name).tag(Optional(person.id))
                        }
                    }
                }
            }

            Section("وردەکاری") {
                TextField("بڕ (دینار)", text: $amountText)
                    .keyboardType(.numberPad)
                DatePicker("بەروار", selection: $date, displayedComponents: .date)
                TextField("وەسف / هۆکار", text: $descriptionText, axis: .vertical)
                    .lineLimit(3...6)
            }

            Section {
                Button {
                    save()
                } label: {
                    Text(saved ? "پاشەکەوت کرا..." : "تۆمارکردنی قەرز")
                        .frame(maxWidth: .infinity)
                }
                .disabled(saved)
            }
        }
        .navigationTitle("قەرزی نوێ")
        .onAppear {
            if let preselectedPerson {
                selectedPersonID = preselectedPerson.id
            }
        }
    }

    private func save() {
        let amount = Money.parse(amountText)
        guard amount > 0 else { return }

        let person: Person
        if let preselectedPerson {
            person = preselectedPerson
        } else if modeNewPerson {
            let trimmed = newName.trimmingCharacters(in: .whitespacesAndNewlines)
            guard !trimmed.isEmpty else { return }
            person = Person(name: trimmed)
            context.insert(person)
        } else if let selectedPersonID,
                  let found = people.first(where: { $0.id == selectedPersonID }) {
            person = found
        } else {
            return
        }

        let debt = Debt(
            person: person,
            type: type,
            amount: amount,
            description: descriptionText,
            date: date
        )
        context.insert(debt)
        saved = true
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.35) {
            dismiss()
        }
    }
}
