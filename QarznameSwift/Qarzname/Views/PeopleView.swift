import SwiftUI
import SwiftData

struct PeopleView: View {
    @Environment(\.modelContext) private var context
    @Query(sort: \Person.name) private var people: [Person]
    @State private var showAdd = false
    @State private var name = ""
    @State private var phone = ""
    @State private var notes = ""
    @State private var search = ""

    private var filtered: [Person] {
        let q = search.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !q.isEmpty else { return people }
        return people.filter {
            $0.name.localizedCaseInsensitiveContains(q) ||
            $0.phone.contains(q) ||
            $0.notes.localizedCaseInsensitiveContains(q)
        }
    }

    var body: some View {
        List {
            if filtered.isEmpty {
                ContentUnavailableView("هیچ کەسێک نییە", systemImage: "person.crop.circle.badge.plus")
            } else {
                ForEach(filtered) { person in
                    NavigationLink {
                        PersonDetailView(person: person)
                    } label: {
                        VStack(alignment: .leading, spacing: 6) {
                            Text(person.name).font(.headline)
                            Text(person.phone.isEmpty ? "بێ ژمارە" : person.phone)
                                .font(.caption)
                                .foregroundStyle(.secondary)
                            HStack(spacing: 8) {
                                if person.owedToMe > 0 {
                                    Text("بۆ من \(Money.iqd(person.owedToMe))")
                                        .font(.caption2.bold())
                                        .padding(.horizontal, 8)
                                        .padding(.vertical, 4)
                                        .background(Color.green.opacity(0.15))
                                        .clipShape(Capsule())
                                }
                                if person.iOwe > 0 {
                                    Text("لە من \(Money.iqd(person.iOwe))")
                                        .font(.caption2.bold())
                                        .padding(.horizontal, 8)
                                        .padding(.vertical, 4)
                                        .background(Color.orange.opacity(0.18))
                                        .clipShape(Capsule())
                                }
                                if person.owedToMe == 0 && person.iOwe == 0 {
                                    Text("سەوز")
                                        .font(.caption2.bold())
                                        .padding(.horizontal, 8)
                                        .padding(.vertical, 4)
                                        .background(Color.gray.opacity(0.12))
                                        .clipShape(Capsule())
                                }
                            }
                        }
                        .padding(.vertical, 4)
                    }
                }
                .onDelete(perform: delete)
            }
        }
        .searchable(text: $search, prompt: "گەڕان بە ناو یان مۆبایل")
        .navigationTitle("کەسەکان")
        .toolbar {
            ToolbarItem(placement: .topBarLeading) {
                Button {
                    showAdd = true
                } label: {
                    Label("کەسی نوێ", systemImage: "plus")
                }
            }
        }
        .sheet(isPresented: $showAdd) {
            NavigationStack {
                Form {
                    Section("زانیاری") {
                        TextField("ناو", text: $name)
                        TextField("مۆبایل", text: $phone)
                            .keyboardType(.phonePad)
                        TextField("تێبینی", text: $notes)
                    }
                }
                .navigationTitle("کەسی نوێ")
                .toolbar {
                    ToolbarItem(placement: .cancellationAction) {
                        Button("هەڵوەشاندنەوە") { showAdd = false }
                    }
                    ToolbarItem(placement: .confirmationAction) {
                        Button("پاشەکەوت") {
                            let trimmed = name.trimmingCharacters(in: .whitespacesAndNewlines)
                            guard !trimmed.isEmpty else { return }
                            context.insert(Person(name: trimmed, phone: phone, notes: notes))
                            name = ""; phone = ""; notes = ""
                            showAdd = false
                        }
                    }
                }
            }
            .environment(\.layoutDirection, .rightToLeft)
        }
    }

    private func delete(at offsets: IndexSet) {
        for index in offsets {
            context.delete(filtered[index])
        }
    }
}
