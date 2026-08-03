import SwiftUI
import SwiftData

struct SettingsView: View {
    @Environment(\.modelContext) private var context
    @Query private var people: [Person]
    @Query private var debts: [Debt]
    @Query private var payments: [Payment]
    @State private var message = ""

    var body: some View {
        Form {
            Section("داتا") {
                LabeledContent("کەسەکان", value: "\(people.count)")
                LabeledContent("قەرزەکان", value: "\(debts.count)")
                LabeledContent("پارەدانەکان", value: "\(payments.count)")
                Text("داتا لەسەر ئایپادەکەت لە SwiftData دەمێنێتەوە.")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
            }

            Section("سڕینەوە") {
                Button("سڕینەوەی هەموو داتا", role: .destructive) {
                    people.forEach { context.delete($0) }
                    message = "هەموو داتا سڕایەوە"
                }
            }

            if !message.isEmpty {
                Section {
                    Text(message).foregroundStyle(.green)
                }
            }

            Section("دەربارە") {
                LabeledContent("ئەپ", value: "قەرزنامە")
                LabeledContent("جۆر", value: "SwiftUI · iPad")
                LabeledContent("Bundle ID", value: "com.qarzname.debtledger")
                Text("ئەمە ئەپی ڕاستەقینەی Swiftـە. لە Xcode کرتە لە ▶️ Run بکە بۆ دامەزراندن لەسەر ئایپاد.")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
            }
        }
        .navigationTitle("ڕێکخستن")
    }
}
